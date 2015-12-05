CardTrasher = class CardTrasher {

  constructor(game, player_cards, source, card_names) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    this.card_names = _.isArray(card_names) ? card_names : [card_names]
  }

  trash() {
    _.each(this.card_names, (card_name) => {
      this.player_cards.trash.push(this.find_card(card_name))
    })

    let has_event_cards = _.any(this.card_names, (card_name) => {
      return _.contains(TrashEventProcessor.event_cards(), card_name)
    })
    let has_reaction_cards = _.any(this.player_cards.hand, (card) => {
      return _.contains(TrashEventProcessor.reaction_cards(), card.name)
    })
    if (_.size(this.player_cards.trash) > 1 && (has_event_cards || has_reaction_cards)) {
      let card_list = _.map(this.card_names, function(card_name) {
        return ClassCreator.create(card_name).to_h()
      })
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to trash cards: (leftmost will be first)',
        cards: this.player_cards.trash
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
      turn_event_processor.process(CardTrasher.order_cards)
    }

    _.each(this.player_cards.trash, (trashed_card) => {
      this.track_trashed_card(trashed_card)
      this.update_log(trashed_card)
      let trash_event_processor = new TrashEventProcessor(this, trashed_card)
      trash_event_processor.process()
      this.put_card_in_trash(trashed_card)
    })

    this.player_cards.trash = []
  }

  find_card(card_name) {
    let card_index = _.findIndex(this.player_cards[this.source], (card) => {
      return card.name === card_name
    })
    return this.player_cards[this.source].splice(card_index, 1)[0]
  }

  track_trashed_card(trashed_card) {
    this.player_cards.trashing.push(trashed_card)
    this.trashed_card_count = _.size(this.player_cards.trashing)
  }

  put_card_in_trash(trashed_card) {
    if (_.size(this.player_cards.trashing) === this.trashed_card_count) {
      if (trashed_card.misfit) {
        trashed_card = ClassCreator.create('Band Of Misfits').to_h()
      }
      if (this.game.turn.possessed) {
        this.player_cards.possession_trash.push(trashed_card)
      } else {
        this.game.trash.push(trashed_card)
      }
    }
  }

  update_log(card) {
    let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> trashes ${CardView.render(card)}`
    if (this.game.turn.possessed) {
      log_message += ', setting the cards aside'
    }
    this.game.log.push(log_message)
  }

  static order_cards(game, player_cards, ordered_card_names, trasher) {
    let new_trash_order = []
    _.each(ordered_card_names, function(card_name) {
      let trash_card = _.find(player_cards.trash, function(card) {
        return card.name === card_name
      })
      new_trash_order.push(trash_card)
    })
    player_cards.trash = new_trash_order
  }

}
