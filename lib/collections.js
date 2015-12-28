Lists = new Mongo.Collection('lists');

Lists.defaultTitle = function() {
  return 'My New List';
};

Todos = new Mongo.Collection('todos');
