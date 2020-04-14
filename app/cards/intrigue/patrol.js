Patrol = class Patrol extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(4)

      _.each(_.clone(player_cards.revealed), function(card) {
        if (_.includes(_.words(card.types), 'victory') || card.name === 'Curse') {
          let card_mover = new CardMover(game, player_cards)
          card_mover.move(player_cards.revealed, player_cards.hand, card)
        }
      })

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
