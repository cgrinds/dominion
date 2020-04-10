Tournament = class Tournament extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    game.turn.self_revealed_province = false
    game.turn.opponent_revealed_province = false

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    _.each(ordered_player_cards, function(other_player_cards) {
      let province = _.find(other_player_cards.hand, function(card) {
        return card.name === 'Province'
      })
      if (province) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: other_player_cards.player_id,
          username: other_player_cards.username,
          type: 'choose_yes_no',
          instructions: `Reveal ${CardView.render(province)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, other_player_cards, turn_event_id, province)
        turn_event_processor.process(Tournament.reveal_province)
      }
    })

    if (game.turn.self_revealed_province) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', game.turn.self_revealed_province)
      card_discarder.discard()

      let duchy = new Duchy()

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a prize or ${CardView.render(duchy)} to gain:`,
        cards: game.prizes.concat(duchy.to_h()),
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Tournament.gain_prize)
    }

    if (!game.turn.opponent_revealed_province) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)

      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }

    delete game.turn.self_revealed_province
    delete game.turn.opponent_revealed_province
  }

  static reveal_province(game, player_cards, response, province) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(new Province())}`)
      if (game.turn.player._id === player_cards.player_id) {
        game.turn.self_revealed_province = province
      } else {
        game.turn.opponent_revealed_province = province
      }
    }
  }

  static gain_prize(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'deck', selected_card.name)
    if (selected_card.name === 'Duchy') {
      card_gainer.gain_game_card()
    } else {
      card_gainer.gain_prize_card()
    }
  }

}
