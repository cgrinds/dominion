Duplicate = class Duplicate extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    this.move_to_tavern(game, player_cards, player.played_card)
  }

  gain_event(gainer, duplicate) {
    let gained_card = ClassCreator.create(gainer.card_name)
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(duplicate)} to gain a copy of ${CardView.render(gained_card)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, {gainer: gainer, duplicate: duplicate})
    turn_event_processor.process(Duplicate.gain_copy)
  }

  static gain_copy(game, player_cards, response, params) {
    if (response === 'yes') {
      let reserve_index = _.findIndex(player_cards.tavern, function(card) {
        return card.id === params.duplicate.id
      })
      let reserve = player_cards.tavern.splice(reserve_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> calls ${CardView.render(reserve)}`)
      player_cards.in_play.push(reserve)

      let card_gainer = new CardGainer(game, player_cards, 'discard', params.gainer.card_name)
      card_gainer.gain_game_card()
    }
  }

}
