Spy = class Spy extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    PlayerCardsModel.update(game._id, player_cards)
    Spy.reveal_card(game, player_cards)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    Spy.reveal_card(game, player_cards)
  }

  static reveal_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Make <strong>${player_cards.username}</strong> discard ${CardView.render(player_cards.revealed)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Spy.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else {
      Card.place_revealed_cards_on_deck(game, player_cards)
    }
  }

}
