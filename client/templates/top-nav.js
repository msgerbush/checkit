var deleteList = function(event, template) {
  var list = template.data.list;
  var item = template.data.item;
  // we must remove each item individually from the client
  Todos.find({listId: list._id}).forEach(function(todo) {
    Todos.remove(todo._id);
  });
  Lists.remove(list._id);

  Router.go('/'+item.type+'s/'+item.id);
  return true;
};

var copyList = function(event, template) {
  var list = template.data.list;
  var item = template.data.item;
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

  Router.go('itemListsShow', {
    _id: item.id,
    item_type: item.type,
    list_id: listCopy._id
  });
  return true;
};

Template.topNav.helpers({
  lists: function() {
    return Lists.find({
      userId: Meteor.userId(),
      linkedItems: {
        $elemMatch: {
          type: this.item.type,
          id: this.item.id
        }
      }
    });
  }
});

Template.topNav.events({
  'click .js-new-list': function(event, template) {
    var item = template.data.item;
    var list = {
      title: Lists.defaulTitle(),
      incompleteCount: 0,
      userId: Meteor.userId(),
      linkedItems: [item]
    };
    list._id = Lists.insert(list);

    Router.go('itemListsShow', {
      _id: item.id,
      item_type: item.type,
      list_id: list._id
    });
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-copy-list': function(event, template) {
    copyList(this, template);
  },

  'click .top-nav_list-link': function (event, template) {
    var item = template.data.item;
    Router.go('itemListsShow', {
      _id: item.id,
      item_type: item.type,
      list_id: this._id
    });
  }
});
