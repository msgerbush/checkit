var deleteList = function(list) {
  Meteor.call('destroyList', list._id);
  Router.go('home');
  return true;
};

var copyList = function(list) {
  var todos = Todos.find({listId: list._id}).fetch();
  Meteor.call('createList',{
    title: "Copy of " + list.title,
    description: list.description,
    linkedItems: list.linkedItems
  }, todos, function (error, listCopyId) {
      if(error){
        console.log(error.reason);
      } else {
        Router.go('listsShow', {_id: listCopyId});
      }
  });
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
  },
  titleText: function () {
    return this.title || Lists.defaultTitle();
  }
});

Template.leftNav.events({
  'click .js-new-list': function() {
    Router.go('listsShow');
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-copy-list': function(event, template) {
    copyList(this, template);
  }
});
