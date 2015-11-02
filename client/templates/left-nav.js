var deleteList = function(list) {
  // we must remove each item individually from the client
  Todos.find({listId: list._id}).forEach(function(todo) {
    Todos.remove(todo._id);
  });
  Lists.remove(list._id);

  Router.go('home');
  return true;
};

var copyList = function(list) {
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

  Router.go('listsShow', listCopy);
  return true;
};

Template.leftNav.onRendered(function() {
  this.find('#content-container')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          if (listFadeInHold) {
            listFadeInHold.release();
          }
        });
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

Template.leftNav.helpers({
  lists: function() {
    return Lists.find({userId: Meteor.userId()});
  },
  activeListClass: function() {
    var current = Router.current();
    if (current.route.name === 'listsShow' && current.params._id === this._id) {
      return 'active';
    }
  }
});

Template.leftNav.events({
  'click .js-new-list': function() {
    var list = {
      title: Lists.defaulTitle(),
      incompleteCount: 0,
      userId: Meteor.userId()
    };
    list._id = Lists.insert(list);

    Router.go('listsShow', list);
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },
  
  'click .js-copy-list': function(event, template) {
    copyList(this, template);
  }
});
