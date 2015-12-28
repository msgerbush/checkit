var deleteList = function(event, template) {
  var list = template.data;
  var params = Router.current().params;
  Meteor.call('destroyList', list._id);

  Router.go('itemShow', {
    item_id: params.item_id,
    item_type: params.item_type
  });
  return true;
};

var copyList = function(event, template) {
  var list = template.data;
  var params = Router.current().params;
  var todos = Todos.find({listId: list._id}).fetch();
  Meteor.call('createList',{
    title: "Copy of " + list.title,
    description: list.description,
    linkedItems: list.linkedItems
  }, todos, function (error, listCopyId) {
      if(error){
        console.log(error.reason);
      } else {
        Router.go('itemListsShow', {
          item_id: params.item_id,
          item_type: params.item_type,
          _id: listCopyId
        });
      }
  });
};

Template.topNav.helpers({
  lists: function() {
    var params = Router.current().params;
    return Lists.find({
      userId: Meteor.userId(),
      linkedItems: {
        $elemMatch: {
          type: params.item_type,
          id: parseInt(params.item_id)
        }
      }
    });
  },
  titleText: function () {
    return this.title || Lists.defaultTitle();
  }
});

Template.topNav.events({
  'click .js-new-list': function(event, template) {
    var params = Router.current().params;
    Router.go('itemListsShow', {
      item_id: params.item_id,
      item_type: params.item_type
    });
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-copy-list': function(event, template) {
    copyList(this, template);
  },

  'click .top-nav_list-link': function (event, template) {
    var params = Router.current().params;
    Router.go('itemListsShow', {
      item_id: params.item_id,
      item_type: params.item_type,
      _id: this._id
    });
  }
});
