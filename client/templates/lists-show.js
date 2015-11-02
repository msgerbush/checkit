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
  Lists.update(list._id, {$set: {title: newTitle}});
};

var saveListDescription = function(list, template) {
  Lists.update(list._id, {$set: {description: template.$('[name=description]').val()}});
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

  'submit .js-todo-new': function(event) {
    event.preventDefault();

    var $input = $(event.target).find('[type=text]');
    if (! $input.val())
      return;

    Todos.insert({
      listId: this._id,
      text: $input.val(),
      checked: false,
      createdAt: new Date()
    });
    Lists.update(this._id, {$inc: {incompleteCount: 1}});
    $input.val('');
  }
});
