PirateShip = class PirateShip extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let opponent_text = _.size(game.players) == 2 ? 'Opponent' : 'Opponents'
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: `Attack ${opponent_text}`, value: 'attack'},
        {text: `Gain $${player_cards.pirate_ship_coins}`, value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
    turn_event_processor.process(PirateShip.process_response)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    if (game.turn.pirate_ship_trashed) {
      player_cards.pirate_ship_coins += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> adds a coin to their ${CardView.render(this)} mat`)
    }
    delete game.turn.pirate_ship_trashed
    delete game.turn.pirate_ship_attack
  }

  static process_response(game, player_cards, response, card_player) {
    if (response[0] === 'attack') {
      game.turn.pirate_ship_attack = true
    } else if (response[0] === 'coin') {
      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(player_cards.pirate_ship_coins)
    }
  }

  attack(game, player_cards) {
    if (game.turn.pirate_ship_attack) {
      if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
      } else {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal_from_deck(2)

        GameModel.update(game._id, game)

        let revealed_treasures = _.filter(player_cards.revealed, (card) => {
          return _.includes(_.words(card.types), 'treasure')
        })
        if (_.size(revealed_treasures) === 1) {
          PirateShip.trash_treasure(game, player_cards, revealed_treasures)
        } else if (_.size(revealed_treasures) > 1) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: game.turn.player._id,
            username: game.turn.player.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: `Choose one of <strong>${player_cards.username}'s</strong> treasures to trash:`,
            cards: revealed_treasures,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(PirateShip.trash_treasure)
        }
        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard()
      }
    }
  }

  static trash_treasure(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards)
    card_trasher.trash()
    game.turn.pirate_ship_trashed = true
  }

}
