var deleteList = function(event, template) {
  var list = template.data.list;
  // we must remove each item individually from the client
  Todos.find({listId: list._id}).forEach(function(todo) {
    Todos.remove(todo._id);
  });
  Lists.remove(list._id);

  Router.go('devicesShow', {_id: template.data.device.id});
  return true;
};

var copyList = function(event, template) {
  var list = template.data.list;
  var listCopy = {
    title: "Copy of " + list.title,
    description: list.description,
    incompleteCount: list.incompleteCount,
    userId: list.userId,
    linkedItems: list.linkedItems
  };
  var timestamp = (new Date()).getTime();
  listCopy._id = Lists.insert(listCopy);

  Todos.find({listId: list._id}).forEach(function(todo) {
    Todos.insert({listId: listCopy._id,
                  text: todo.text,
                  createdAt: new Date(timestamp)});
    timestamp += 1; // ensure unique timestamp.
  });

  Router.go('deviceListsShow', {_id: template.data.device.id,
    list_id: listCopy._id});
  return true;
};

Template.topNav.helpers({
  lists: function() {
    return Lists.find({
      userId: Meteor.userId(),
      linkedItems: {
        $elemMatch: {
          type: this.device.type,
          id: this.device.id
        }
      }
    });
  }
});

Template.topNav.events({
  'click .js-new-list': function(event, template) {
    var device = template.data.device;
    var list = {
      title: Lists.defaulTitle(),
      incompleteCount: 0,
      userId: Meteor.userId(),
      linkedItems: [device]
    };
    list._id = Lists.insert(list);

    Router.go('deviceListsShow', {_id: device.id, list_id: list._id});
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-copy-list': function(event, template) {
    copyList(this, template);
  },

  'click .top-nav_list-link': function (event, template) {
    Router.go('deviceListsShow', {_id: template.data.device.id,
      list_id: this._id});
  }
});
