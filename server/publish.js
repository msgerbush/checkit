Meteor.publish('lists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId});
  } else {
    return [];
  }
});

Meteor.publish('todos', function(listId) {
  check(listId, String);
  if (this.userId && Lists.find({_id: listId, userId: this.userId}).count() > 0) {
    return Todos.find({listId: listId});
  } else {
    return [];
  }
});

Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'services.spiceworks': 1}});
  } else {
    return [];
  }
});
