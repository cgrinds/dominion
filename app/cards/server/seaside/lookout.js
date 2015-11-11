Lookout = class Lookout extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) < 3 && _.size(player_cards.discard) > 0) {
        this.shuffle_discard(player_cards)
      }
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      if (_.size(player_cards.revealed) === 1) {
        let card_trasher = new CardTrasher(game, player_cards.username, player_cards.revealed, player_cards.revealed[0].name)
        card_trasher.trash()
        game.log.push(`&nbsp;&nbsp;but has no cards left to continue`)
      } else {
        let turn_event_id = TurnEvents.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to trash:`,
          cards: player_cards.revealed,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Lookout.trash_card)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_trasher = new CardTrasher(game, player_cards.username, player_cards.revealed, selected_card.name)
    card_trasher.trash()
    if (_.size(player_cards.revealed) === 1) {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()
      game.log.push(`&nbsp;&nbsp;but has no cards left to continue`)
    } else {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to discard:`,
        cards: player_cards.revealed,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Lookout.discard_card)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_some(selected_cards)

    player_cards.deck.unshift(player_cards.revealed[0])
    player_cards.revealed = []
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts the remaining card on top of their deck`)
  }

}
