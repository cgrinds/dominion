Advance = class Advance extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Advance.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash an action`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      let trashed_cards =card_trasher.trash()

      let eligible_cards = _.filter(game.cards, (card) => {
        return _.includes(_.words(card.top_card.types), 'action') && card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 7)
      })

      if (_.size(eligible_cards) > 0) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Advance.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash an action`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
