DameNatalie = class DameNatalie extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 4)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain: (or none to skip)',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(DameNatalie.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }

    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
