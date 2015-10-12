ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
  }

  player_decline() {
    this.declined_players = [Meteor.user()]
    this.decline()
  }

  timeout_decline() {
    this.declined_players = _.filter(this.proposal.players, function(player) {
      return !player.accepted
    })
    this.decline()
  }

  decline() {
    Proposals.remove(this.proposal._id)
    this.notify_players()
    this.update_players()
  }

  notify_players() {
    Streamy.groupEmit('decline', {decliners: this.declined_players}, Streamy.userSockets(this.player_ids()))
  }

  update_players() {
    _.each(this.proposal.players, function(player) {
      Meteor.users.update(player._id, {
        $unset: {has_proposal: ''}
      })
    })
  }

  player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player._id
    })
  }

}
