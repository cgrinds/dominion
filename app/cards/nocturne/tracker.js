// The name Tracker conflicts with a Meteor Object of the same name
TrackerCard = class TrackerCard extends Card {

  types() {
    return ['action', 'fate']
  }

  name() {
    return 'Tracker'
  }

  image() {
    return 'tracker'
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let boon_receiver = new EffectReceiver(game, player_cards, 'boon')
    boon_receiver.receive()
  }

  gain_event(gainer) {
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(gainer.gained_card)} on top of your deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, gainer)
    turn_event_processor.process(TrackerCard.put_on_deck)
  }

  static put_on_deck(game, player_cards, response, gainer) {
    if (response === 'yes') {
      player_cards.deck.unshift(player_cards[gainer.destination].shift())
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(gainer.gained_card)} on top of their deck`)
      gainer.destination = 'deck'
    }
  }

}
