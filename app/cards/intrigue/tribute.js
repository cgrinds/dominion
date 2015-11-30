Tribute = class Tribute extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
    let next_player = next_player_query.next_player()
    let next_player_cards = PlayerCardsModel.findOne({
      game_id: game._id,
      player_id: next_player._id
    })

    next_player_cards.revealed = _.take(next_player_cards.deck, 2)
    next_player_cards.deck = _.drop(next_player_cards.deck, 2)

    let revealed_card_count = _.size(next_player_cards.revealed)
    if (revealed_card_count < 2 && _.size(next_player_cards.discard) > 0) {
      DeckShuffler.shuffle(next_player_cards)
      next_player_cards.revealed = next_player_cards.revealed.concat(_.take(next_player_cards.deck, 2 - revealed_card_count))
      next_player_cards.deck = _.drop(next_player_cards.deck, 2 - revealed_card_count)
    }

    game.log.push(`&nbsp;&nbsp;<strong>${next_player_cards.username}</strong> reveals ${CardView.render(next_player_cards.revealed)}`)

    let revealed_cards = _.uniq(next_player_cards.revealed, function(card) {
      return card.name
    })
    let card_discarder = new CardDiscarder(game, next_player_cards, 'revealed')
    card_discarder.discard_all()
    PlayerCardsModel.update(next_player_cards._id, next_player_cards)

    let coins = 0
    let cards = 0
    let actions = 0
    let gains = []
    _.each(revealed_cards, function(card) {
      if (_.contains(card.types, 'action')) {
        actions += 2
      }
      if (_.contains(card.types, 'treasure')) {
        coins += 2
      }
      if (_.contains(card.types, 'victory')) {
        cards += 2
      }
    })
    game.turn.actions += actions
    game.turn.coins += coins

    if (actions > 0) {
      gains.push(`+${actions} actions`)
    }
    if (coins > 0) {
      gains.push(`+$${coins}`)
    }
    if (!_.isEmpty(gains)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gains.join(' and ')}`)
    }

    if (cards > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(cards)
    }
  }

}
