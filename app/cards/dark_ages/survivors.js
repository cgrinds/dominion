Survivors = class Survivors extends Ruins {

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 2)
      player_cards.deck = _.drop(player_cards.deck, 2)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 2 && _.size(player_cards.discard) > 0) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 2 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 2 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `${CardView.render(player_cards.revealed)}`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Discard all cards', value: 'discard'},
          {text: 'Return cards to deck', value: 'deck'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Survivors.process_response)
    }
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else if (response === 'deck') {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: player_cards.revealed
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Survivors.replace_cards)
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function(card) {
        return card.id === ordered_card.id
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the cards back on their deck`)
    player_cards.revealed = []
  }

}
