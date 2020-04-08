TurnEventSubmission = class TurnEventSubmission {

  constructor(turn_event, selection) {
    this.turn_event = turn_event
    this.selection = selection
    this.error_text = turn_event.type === 'choose_cards' ? 'card(s)' : 'option(s)'
  }

  valid_selection() {
    if (this.turn_event.type === 'overpay') {
      if (this.selection < this.turn_event.minimum) {
        this.error = `You can't overpay less than ${this.turn_event.minimum}`
      } else if (this.selection > this.turn_event.maximum) {
        this.error = `You can't overpay more than ${this.turn_event.maximum}`
      }
    } else if (this.turn_event.type !== 'sort_cards') {
      if (this.turn_event.maximum > 0 && this.selection.length > this.turn_event.maximum) {
        this.error = `You can select no more than ${this.turn_event.maximum} ${this.error_text}`
      } else if (this.turn_event.minimum > 0 && this.selection.length < this.turn_event.minimum) {
        this.error = `You must select at least ${this.turn_event.minimum} ${this.error_text}`
      }
    }
    return this.error === undefined
  }

  selected_values() {
    if (this.turn_event.type === 'choose_yes_no') {
      return this.yes_no_selection()
    } else if (this.turn_event.type === 'choose_cards') {
      return this.card_selection()
    } else if (this.turn_event.type === 'choose_options') {
      return this.options_selection()
    } else if (this.turn_event.type === 'sort_cards') {
      return this.sort_selection()
    } else if (this.turn_event.type === 'overpay') {
      return this.selection
    }
  }

  yes_no_selection() {
    return this.selection.first().val()
  }

  options_selection() {
    return this.selection.map(function() {
      return $(this).val()
    }).get()
  }

  card_selection() {
    let indexes = this.selection.map(function() {
      return $(this).val()
    }).get()
    return _.map(indexes, (index) => {
      return this.turn_event.cards[index]
    })
  }

  sort_selection() {
    return _.map(this.selection, (index) => {
      return this.turn_event.cards[index]
    })
  }

  error_message() {
    return this.error
  }

}
