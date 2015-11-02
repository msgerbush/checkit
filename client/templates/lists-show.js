Template.listsShow.helpers({

  todosReady: function() {
    return Router.current().todosHandle.ready();
  },

  todos: function(listId) {
    return Todos.find({listId: listId}, {sort: {createdAt : -1}});
  }
});

var saveListTitle = function(list, template) {
  var newTitle = template.$('[name=title]').val() || Lists.defaulTitle();
  Meteor.call('updateList', list._id, {title: newTitle});
};

var saveListDescription = function(list, template) {
  Meteor.call('updateList', list._id,
    {description: template.$('[name=description]').val()});
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
    saveListTitle(this, template);
  },

  'blur .js-description-input': function(event, template) {
    saveListDescription(this, template);
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
    if (! $input.val())
      return;

    Meteor.call('createTodo', {
      listId: this._id,
      text: $input.val(),
      checked: false
    });
    $input.val('');
  }
});
