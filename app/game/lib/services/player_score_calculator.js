PlayerScoreCalculator = class PlayerScoreCalculator {

  constructor(player_cards) {
    this.player_cards = player_cards
    this.card_sources = AllPlayerCardsQuery.card_sources()
  }

  calculate() {
    return _.reduce(this.card_sources, this.add_points_from_source.bind(this), 0) + this.player_cards.victory_tokens
  }

  add_points_from_source(points, source) {
    return points + _.reduce(this.player_cards[source], (points_from_source, card) => {
      return points_from_source + this.card_points(card, source)
    }, 0)
  }

  card_points(card, source) {
    let point_card = ClassCreator.create(card.name)
    return point_card.victory_points(this.player_cards, source)
  }

}
