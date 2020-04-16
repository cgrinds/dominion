BanditCamp = class BanditCamp extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Spoils')
    card_gainer.gain()
  }

}
