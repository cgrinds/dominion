TragicHero = class TragicHero extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(3)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.hand) > 7) {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
      card_trasher.trash()

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'treasure')
      })

      if (_.size(eligible_cards) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(TragicHero.gain_treasure)
      } else if (_.size(eligible_cards) === 1) {
        TragicHero.gain_treasure(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available treasures to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static gain_treasure(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
