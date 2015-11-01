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
    userId: list.userId
  }
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

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-copy-list': function(event, template) {
    copyList(this, template);
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
