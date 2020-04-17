Mint = class Mint extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to reveal (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Mint.reveal_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a treasure`)
    }
  }

  static reveal_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal(player_cards.hand, selected_cards)

      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a treasure`)
    }
  }

  buy_event(buyer) {
    let treasures_to_trash = _.filter(buyer.player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    let card_trasher = new CardTrasher(buyer.game, buyer.player_cards, 'in_play', treasures_to_trash)
    card_trasher.trash()
  }

}
