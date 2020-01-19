CoinTokenPlayer = class CoinTokenPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    if (this.can_play()) {
      this.update_phase()
      this.game.log.push(`<strong>${this.player_cards.username}</strong> spends a coin token`)
      this.player_cards.coin_tokens -= 1
      CoinGainer.gain(this.game, this.player_cards, 1)
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
    start_buy_event_processor.process()
    this.game.turn.phase = 'treasure'
  }

  can_play() {
    return _.includes(['action', 'treasure'], this.game.turn.phase) && this.player_cards.coin_tokens > 0
  }

}
