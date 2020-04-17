Mountebank = class Mountebank extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let curse = _.find(player_cards.hand, function(card) {
      return card.name === 'Curse'
    })

    if (curse) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(curse)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, curse)
      turn_event_processor.process(Mountebank.discard_curse)
    } else {
      Mountebank.gain_cards(game, player_cards)
    }
  }

  static discard_curse(game, player_cards, response, curse) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', curse)
      card_discarder.discard()
    } else {
      Mountebank.gain_cards(game, player_cards)
    }
  }

  static gain_cards(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    card_gainer.gain()

    card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
    card_gainer.gain()
  }

}
