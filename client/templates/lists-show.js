Template.listsShow.helpers({

  todosReady: function() {
    var handle = Router.current().todosHandle;
    return !handle || handle.ready();
  },

  todos: function(listId) {
    return Todos.find({listId: listId}, {sort: {createdAt : 1}});
  }
});

var createList = function (attrs, todos) {
  Meteor.call('createList', attrs, todos, function (error, newListId) {
    var params;
    if(error){
      console.log(error.reason);
    } else {
      params = _.extend(Router.current().params, {_id: newListId});
      Router.go(Router.current().route.name, params);
    }
  });
};

var updateList = function(list, newAttrs) {
  var attrs = _.extend(list, newAttrs);
  if(list._id){
    Meteor.call('updateList', list._id, attrs);
  } else {
    createList(attrs);
  }
};

Template.listsShow.events({
  'keydown .js-title-input,.js-description-input': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },

  'blur .js-title-input': function(event, template) {
    var newTitle = template.$('[name=title]').val();

    if(newTitle === this.title ||
      (_.isEmpty(newTitle) && _.isEmpty(this.title))){ return; }

    updateList(this, {title: newTitle});
  },

  'blur .js-description-input': function(event, template) {
    var newDescription = template.$('[name=description]').val();

    if(newDescription === this.description ||
      (_.isEmpty(newDescription) && _.isEmpty(this.description))){ return; }

    updateList(this, {description: newDescription});
  },

  'focus .js-todo-new input[type=text]': function(event, template) {
    template.$('.js-todo-new').addClass('adding');
  },

  'blur .js-todo-new input[type=text]': function(event, template) {
    template.$('.js-todo-new').removeClass('adding');
  },

  'submit .js-todo-new, click .js-add-todo-button': function(event, template) {
    event.preventDefault();

    var $input = template.$('.js-todo-new input[type=text]');
    var todo;

    if (! $input.val())
      return;

    todo = {
      text: $input.val(),
      checked: false
    };

    if(!this._id){
      createList(this, [todo]);
    } else {
      todo.listId = this._id;
      Meteor.call('createTodo', todo);
    }

    $input.val('');
  }
});
