FoolsGold = class FoolsGold extends Card {

  types() {
    return ['treasure', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    if (game.turn.fools_gold) {
      CoinGainer.gain(game, player_cards, 4)
    } else {
      game.turn.fools_gold = true
      CoinGainer.gain(game, player_cards, 1)
    }
  }

  gain_reaction(game, player_cards, gainer, card) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Trash ${CardView.render(card)} to gain a ${CardView.render(new Gold())}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card)
    turn_event_processor.process(FoolsGold.trash_for_gold)
  }

  static trash_for_gold(game, player_cards, response, card) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', card.id)
      card_trasher.trash()

      let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
      card_gainer.gain()
    }
  }

}
