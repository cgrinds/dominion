Outpost = class Outpost extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (game.turn.previous_player._id !== game.turn.player._id && !game.turn.outpost) {
      game.turn.outpost = card_player.card
      return 'duration'
    }
  }

  stay_in_play(game, player_cards, outpost) {
    return game.turn.outpost && game.turn.outpost.id === outpost.id
  }
}
