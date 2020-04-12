Bureaucrat = class Bureaucrat extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Silver')
    card_gainer.gain_game_card()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'victory')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a victory card to place on deck:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(Bureaucrat.return_card_to_deck)
    } else if (_.size(eligible_cards) === 1) {
      Bureaucrat.return_card_to_deck(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
    }
  }

  static return_card_to_deck(game, player_cards, selected_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal(selected_cards)

    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.deck, selected_cards[0])

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${CardView.render(selected_cards[0])} on top of their deck`)
  }

}
