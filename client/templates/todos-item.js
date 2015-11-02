var EDITING_KEY = 'EDITING_TODO_ID';

Template.todosItem.helpers({
  checkedClass: function() {
    return this.checked && 'checked';
  },
  editingClass: function() {
    return Session.equals(EDITING_KEY, this._id) && 'editing';
  }
});

Template.todosItem.events({
  'change [type=checkbox]': function(event) {
    var checked = $(event.target).is(':checked');
    Meteor.call('setChecked', this._id, checked);
  },

  'focus input[type=text]': function(event) {
    Session.set(EDITING_KEY, this._id);
  },

  'blur input[type=text]': function(event) {
    if (Session.equals(EDITING_KEY, this._id))
      Session.set(EDITING_KEY, null);
  },

  'keydown input[type=text]': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },

  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once
  // every 300ms)
  'keyup input[type=text]': _.throttle(function(event) {
    Meteor.call('updateTodo', this._id, {text: event.target.value});
  }, 300),

  'click .js-delete-item': function() {
    Meteor.call('destroyTodo', this._id);
  },

  'click .js-edit-item': function(event, template) {
    template.$('input[type="text"]').focus();
  }
});
