MiningVillage = class MiningVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let mining_village = _.find(player_cards.playing, function(card) {
      return card.inherited_name === 'Mining Village'
    })

    if (mining_village) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Trash ${CardView.render(player.played_card)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, player.played_card)
      turn_event_processor.process(MiningVillage.trash_card)
    }
  }

  static trash_card(game, player_cards, response, played_card) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', played_card)
      card_trasher.trash()

      let gained_coins = CoinGainer.gain(game, player_cards, 2)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

}
