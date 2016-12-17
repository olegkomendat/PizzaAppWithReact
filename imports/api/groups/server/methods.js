import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import '../groups.js';

Meteor.methods({
  CreateGroup: function (name) {
    check(name, String);
    Roles.removeUsersFromRoles(Meteor.userId(), 'guest');
    Roles.addUsersToRoles(Meteor.userId(), ['admin']);
    let info = { 
    	name: name, 
      image: '', 
      AdminGroup: Meteor.userId(), 
      AdminGroupName: Meteor.user().emails[0].address,
      dateCreate: new Date(), 
      invite: [],
      users: [],
      menu: {},
      coupons: []
    }
    Groups.insert( info );
  },  
  DeleteGroup: function() {
    Roles.removeUsersFromRoles( Meteor.userId(), 'admin');
    Roles.addUsersToRoles(Meteor.userId(), ['guest']);
    let Group = Groups.findOne({'AdminGroup': Meteor.userId()});
    _.each(Group.users, function(id){ 
      Roles.removeUsersFromRoles( id, 'user');
      Roles.addUsersToRoles( id, 'guest');
         
    });
   Groups.remove({'_id': Group._id});
   //Events.remove({'GroupId': Group._id});
   //Orders.remove({'GroupId': Group._id});
  },
    SendInvite: function(userId){
    check(userId, String);
    Groups.update({ 'AdminGroup': Meteor.userId() }, { $push: { 'invite': {'userId': userId} } });
  },  
    AcceptInviteToGroup: function(groupId){
    check(groupId, String);
    Roles.removeUsersFromRoles( Meteor.userId(), 'guest');
    Roles.addUsersToRoles(Meteor.userId(), ['user']);
    Groups.update({'_id': groupId }, { $push: { 'users': Meteor.userId() } });
    Groups.update({invite:{userId:Meteor.userId()}}, { $pull: { "invite" : { userId: Meteor.userId()} } },{multi: true});
  },
    DeclineInviteToGroup: function(groupId){
    check(groupId, String);
    Groups.update({'_id': groupId }, { $pull: { "invite" : { userId: Meteor.userId()} } }, false, true );
  },
  RemoveUserFromGroup: function(userId){
    check(userId, String);
    Roles.removeUsersFromRoles( userId, 'user');
    Roles.addUsersToRoles(Meteor.userId(), ['guest']);
    Groups.update({'AdminGroup': Meteor.userId() }, { $pull: { 'users': userId } });
  }
});