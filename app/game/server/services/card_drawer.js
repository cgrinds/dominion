CardDrawer = class CardDrawer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.original_hand_count = _.size(this.player_cards.hand)
    this.source = source
  }

  draw(to_draw_count, announce = true) {
    if (this.player_cards.tokens.minus_card) {
      to_draw_count -= 1
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards their -1 card token`)
      delete this.player_cards.tokens.minus_card
    }

    this.draw_cards(to_draw_count)

    if (this.drawn_card_count() < to_draw_count) {
      DeckShuffler.shuffle(this.game, this.player_cards)
      this.draw_cards(to_draw_count - this.drawn_card_count())
    }

    if (announce) {
      this.update_log()
    }

    return this.drawn_card_count()
  }

  draw_cards(count) {
    this.player_cards.hand = this.player_cards.hand.concat(_.take(this.player_cards.deck, count))
    this.player_cards.deck = _.drop(this.player_cards.deck, count)
  }

  drawn_card_count() {
    return _.size(this.player_cards.hand) - this.original_hand_count
  }

  update_log() {
    let card_text = this.drawn_card_count === 1 ? 'card' : 'cards'
    let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> draws ${this.drawn_card_count()} ${card_text}${source_text}`)
  }

}
