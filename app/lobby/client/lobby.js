import Bootstrap from 'bootstrap'

Template.lobby.onCreated(registerStreams)
Template.lobby.onRendered(createPopovers)

Template.lobby.events({
  "submit #chat": sendMessage,
  "submit #lobby": proposeGame,
  "click #decline-proposal": declineProposal,
  "click #accept-proposal": acceptProposal
})

function registerStreams() {
  Streamy.on('lobby_message', updateChatWindow)
}

function createPopovers() {
  $('body').popover({
    selector: '.lobby-card',
    html: true,
    content: function() {
      return $(this).next('.card-tooltip').html()
    },
    trigger: 'hover'
  })
}

function updateChatWindow(data) {
  let chat_window = $('#lobby-chat')
  chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
  chat_window.scrollTop(chat_window[0].scrollHeight)
}

function isValidKingdom(kingdom_id) {
  return GameHistory.findOne(kingdom_id)
}

function sendMessage(event) {
  event.preventDefault()
  Streamy.broadcast('lobby_message', {
    username: Meteor.user().username,
    message: event.target.message.value
  })
  event.target.message.value = ''
}

function proposeGame(event) {
  event.preventDefault()

  player_ids = $('.lobby-player:checked').map(function() {
    return $(this).val()
  }).get()

  exclusions = $('.card-set:checked').map(function() {
    return $(this).val()
  }).get()

  kingdom_id = _.trim($('.kingdom-id').val())

  edition = $('.edition:checked').val()

  if (player_ids.length > 3) {
    alert('Game can not have more than 4 players.')
  } else if (player_ids.length < 1) {
    alert('Game must have at least 2 players.')
  } else if (kingdom_id !== '' && !isValidKingdom(kingdom_id)) {
    alert('Game ID is invalid.')
  } else {
    Meteor.call('proposeGame', player_ids, exclusions, kingdom_id, edition)
  }
}

function declineProposal(event) {
  event.preventDefault()
  Meteor.call('declineProposal', $('#proposal_id').val())
}

function acceptProposal(event) {
  event.preventDefault()
  Meteor.call('acceptProposal', $('#proposal_id').val())
}

function removePopover() {
  $('.popover').remove()
}
