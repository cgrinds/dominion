Mandarin = class Mandarin extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 3)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on deck:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Mandarin.return_card_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static return_card_to_deck(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_index = _.findIndex(player_cards.hand, function(card) {
      return card.id === selected_card.id
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places a card on top of their deck`)

    player_cards.deck.unshift(player_cards.hand[card_index])
    player_cards.hand.splice(card_index, 1)
  }

  gain_event(gainer) {
    let treasures = _.filter(gainer.player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (_.size(treasures) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: treasures
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(Mandarin.replace_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${gainer.player_cards.username}</strong> does not have any treasures in play`)
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    let replaced_cards = []
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let card_index = _.findIndex(player_cards.in_play, function(card) {
        return card.id === ordered_card.id
      })
      let card = player_cards.in_play.splice(card_index, 1)[0]
      replaced_cards.push(card)
      if (card.misfit) {
        card = card.misfit
      }
      player_cards.deck.unshift(card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${CardView.render(replaced_cards)} on their deck`)
  }

}
