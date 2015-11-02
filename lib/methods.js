var verifyListOwner = function (listId) {
  // Make sure the user is logged in and it's their list
  var userId = Meteor.userId();
  if (!userId || Lists.findOne(listId).userId !== userId) {
    throw new Meteor.Error("not-authorized");
  }
};

Meteor.methods({
  setChecked: function (todoId, checked) {
    check(todoId, String);
    var todo = Todos.findOne(todoId);
    verifyListOwner(todo.listId);
    Todos.update(todoId, {$set: {checked: checked}});
    Lists.update(todo.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
    return todo._id;
  },
  createTodo: function (attrs) {
    var whitelistedParams;
    var todoId;
    check(attrs.listId, String);
    verifyListOwner(attrs.listId);

    whitelistedParams = _.pick(attrs, 'text', 'checked', 'listId');
    whitelistedParams.createdAt = new Date();
    todoId = Todos.insert(whitelistedParams);
    Lists.update(attrs.listId, {$inc: {incompleteCount: 1}});
    return todoId;
  },
  createList: function (attrs, todos) {
    var date = new Date();
    var whitelistedParams = _.pick(attrs, 'title', 'description', 'linkedItems');
    var incompleteCount = todos ? todos.length : 0;
    var listId;

    _.extend(whitelistedParams, {
      userId: Meteor.userId(),
      createdAt: date++,
      incompleteCount: incompleteCount
    });

    listId = Lists.insert(whitelistedParams);

    _.each(todos, function(todo) {
      Todos.insert({
        listId: listId,
        text: todo.text,
        createdAt: date++
      });
    });

    return listId;
  },
  updateTodo: function (todoId, attrs) {
    var todo = Todos.findOne(todoId);
    var whitelistedParams;
    verifyListOwner(todo.listId);

    whitelistedParams = _.pick(attrs, 'text', 'checked');
    Todos.update(todoId, {$set: whitelistedParams});
    return todo._id;
  },
  updateList: function (listId, attrs) {
    var whitelistedParams;
    check(listId, String);
    verifyListOwner(listId);

    whitelistedParams = _.pick(attrs, 'title', 'description');
    Lists.update(listId, {$set: whitelistedParams});
    return listId;
  },
  destroyList: function (listId) {
    check(listId, String);
    verifyListOwner(listId);

    Todos.remove({listId: listId});
    Lists.remove(listId);
    return listId;
  },
  destroyTodo: function (todoId) {
    var todo = Todos.findOne(todoId);
    check(todoId, String);
    verifyListOwner(todo.listId);

    Todos.remove(todoId);
    if (!todo.checked)
      Lists.update(todo.listId, {$inc: {incompleteCount: -1}});

    return todoId;
  }
});
