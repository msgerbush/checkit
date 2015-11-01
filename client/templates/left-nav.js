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
  // We use #each on an array of one item so that the "list" template is
  // removed and a new copy is added when changing lists, which is
  // important for animation purposes. #each looks at the _id property of it's
  // items to know when to insert a new item and when to update an old one.
  thisArray: function() {
    return [this];
  },
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
  }
});
