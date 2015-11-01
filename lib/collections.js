Lists = new Mongo.Collection('lists');

// Calculate a default name for a list in the form of 'List 123'
Lists.defaulTitle = function() {
  var count = Lists.find({title: /^List \d+$/}).count();
  return 'List ' + (count + 1);
};

Todos = new Mongo.Collection('todos');
