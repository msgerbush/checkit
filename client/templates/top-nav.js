var deleteList = function(event, template) {
  var list = template.data.list;
  var item = template.data.item;

  Meteor.call('destroyList', list._id);

  Router.go('/'+item.type+'s/'+item.id);
  return true;
};

var copyList = function(event, template) {
  var list = template.data.list;
  var item = template.data.item;
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
          _id: item.id,
          item_type: item.type,
          list_id: listCopyId
        });
      }
  });
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
    var list_id = Meteor.call('createList', {
      title: Lists.defaulTitle(),
      linkedItems: [item]
    }, function (error, listId) {
        if(error){
          console.log(error.reason);
        } else {
          Router.go('itemListsShow', {
            _id: item.id,
            item_type: item.type,
            list_id: listId
          });
        }
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
