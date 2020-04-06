Sacrifice = class Sacrifice extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Sacrifice.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0].name)
    card_trasher.trash()

    let trashed_card = selected_cards[0]
    if (player_cards.tokens.estate && trashed_card.name === 'Estate') {
      estate = ClassCreator.create('Estate').to_h()
      estate.id = trashed_card.id
      trashed_card = estate
    }

    let selected_card_types = _.words(trashed_card.types)

    if (_.includes(selected_card_types, 'action')) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)

      game.turn.actions += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
    }

    if (_.includes(selected_card_types, 'treasure')) {
      let gained_coins = CoinGainer.gain(game, player_cards, 2)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }

    if (_.includes(selected_card_types, 'victory')) {
      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.victory_tokens += 2
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +2 &nabla;`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.victory_tokens += 2
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 &nabla;`)
      }
    }
  }

}
