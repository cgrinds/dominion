Raider = class Raider extends Duration {

  types() {
    return ['night', 'duration', 'attack']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  attack(game, player_cards, attacker_player_cards) {
    if (_.size(player_cards.hand) > 4) {
      let copy_card_names = _.uniq(_.map(attacker_player_cards.in_play, 'name'))
      let eligible_cards = _.filter(player_cards.hand, function(card) {
        return _.includes(copy_card_names, card.name)
      })
      if (_.size(eligible_cards) > 1) {
          let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to discard from hand:`,
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Raider.discard_from_hand)
      } else if (_.size(eligible_cards) === 1) {
        Raider.discard_from_hand(game, player_cards, eligible_cards)
      } else {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal('hand')
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  duration(game, player_cards, raider) {
    let coin_gainer = new CoinGainer(game, player_cards, undefined, raider)
    coin_gainer.gain(3)
  }

}
