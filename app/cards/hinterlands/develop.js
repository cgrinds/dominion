Develop = class Develop extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
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
      turn_event_processor.process(Develop.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    game.turn.develop_card = selected_cards[0]

    let card_trasher = new CardTrasher(game, player_cards, 'hand', game.turn.develop_card)
    card_trasher.trash()

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose Which To Gain First:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Gain +$1 Card', value: 'gain_more'},
        {text: 'Gain -$1 Card', value: 'gain_less'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Develop.process_response)

    delete game.turn.develop_card
  }

  static process_response(game, player_cards, response) {
    response = response[0]

    let first_cost = response === 'gain_more' ? 1 : -1
    let second_cost = first_cost * -1

    Develop.choose_card(game, player_cards, first_cost)
    GameModel.update(game._id, game)
    Develop.choose_card(game, player_cards, second_cost)
  }

  static choose_card(game, player_cards, coin_modifier) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.card_equal_to(game, game.turn.develop_card, card.top_card, coin_modifier)
    })

    let coin_cost = CostCalculator.calculate(game, game.turn.develop_card) + coin_modifier
    let debt_cost = game.turn.develop_card.debt_cost > 0 ? `<span class="debt">${game.turn.develop_card.debt_cost}</span>` : ''
    let potion_symbols = _.times(game.turn.develop_card.potion_cost, function() {
      return '&oplus;'
    }).join('')

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card costing $${coin_cost}${debt_cost}${potion_symbols} to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Develop.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards costing $${coin_cost}${debt_cost}${potion_symbols}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
