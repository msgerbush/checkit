var bootstrapLists = function () {
  var data = [
    {title: "My First List - checkIT Out",
     todos: [
       {text: "Try clicking the title to spice IT up!"},
       {text: "Don't forget to a description"},
       {text: "Click to start editing me"},
       {text: "The green arrow on the left will mark a task finished"},
       {text: "Remove a task with the trashcan"},
       {text: "Add a new task below"},
       {text: "Duplicate or remove this list in the top right"},
       {text: "Explore the checkIT tab on tickets and devices!"},
       {text: "???"},
       {text: "Profit."}
     ]
    },
    {title: "Languages",
     todos: [
       {text: "Lisp"},
       {text: "C"},
       {text: "C++"},
       {text: "Python"},
       {text: "Ruby"},
       {text: "JavaScript"},
       {text: "Scala"},
       {text: "Erlang"},
       {text: "6502 Assembly"}
     ]
    },
    {title: "Favorite Scientists",
     todos: [
       {text: "Ada Lovelace"},
       {text: "Grace Hopper"},
       {text: "Marie Curie"},
       {text: "Carl Friedrich Gauss"},
       {text: "Nikola Tesla"},
       {text: "Claude Shannon"}
     ]
    }
  ];
  var userId = Meteor.userId();
  if (Lists.find({userId: userId}).count() === 0) {
    _.each(data, function(list) {
      var list_id = Meteor.call('createList', {
        title: list.title
      }, list.todos);
    });
  }
};

Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'application',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('lists'),
      Meteor.subscribe('userData')
    ];
  }
});

card = null;

if (Meteor.isClient) {
  Meteor.startup(function () {
    card = new SW.Card();
  });

  Router.onBeforeAction('loading');
  Router.onBeforeAction('dataNotFound');

  Router.onBeforeAction(function () {
    if (Accounts.loginServicesConfigured() && !Meteor.userId()) {
      Meteor.loginWithSpiceworks();
      this.render('appAuthenticating');

      pause();
    }
  });
}

Router.route('listsShow', {
  path: '/lists/:_id?',
  onBeforeAction: function () {
    if(this.params._id){
      this.todosHandle = Meteor.subscribe('todos', this.params._id);
    }
  },
  data: function () {
    if(this.params._id){
      return Lists.findOne(this.params._id);
    } else {
      return {};
    }
  },
  action: function () {
    this.render('fullPagePlacement');
  }
});

Router.route('itemListsShow', {
  path: '/:item_type/:item_id/list/:_id?',
  onBeforeAction: function () {
    if(this.params._id){
      this.todosHandle = Meteor.subscribe('todos', this.params._id);
    }
  },
  data: function () {
    var item = Session.get('item');
    var list;

    if(this.params._id){
      list = Lists.findOne(this.params._id);
    } else {
      list = {
        linkedItems: [item]
      };
    }
    return list;
  },
  action: function () {
    this.render('itemPlacement');
  }
});


Router.route('itemShow', {
  path: '/:item_type/:item_id',
  action: function () {
    var firstList = Lists.findOne({
      userId: Meteor.userId(),
      linkedItems: {$elemMatch: {
        type: this.params.item_type, id: parseInt(this.params.item_id)}}
    });
    Router.go('itemListsShow', {
      item_id: this.params.item_id,
      item_type: this.params.item_type,
      _id: firstList && firstList._id
    });
  }
});

Router.route('devices', {
  path: '/devices',
  waitOn: function () {
    card.services('inventory').on('device:show', function (deviceId) {
      card.services('inventory').request('device', deviceId)
        .then(function (device) {
          Session.set('item', {
            id: device.id,
            type: 'device',
            name: device.name
          });
        });
    });
    return function () {
      return Session.get('item');
    };
  },
  action: function () {
    Router.go('itemShow', {item_id: Session.get('item').id, item_type: 'device'});
  }
});

Router.route('tickets', {
  path: '/tickets',
  waitOn: function () {
    card.services('helpdesk').on('showTicket', function (ticketId) {
      card.services('helpdesk').request('ticket', ticketId)
        .then(function (ticket) {
          Session.set('item', {
            id: ticket.id,
            type: 'ticket',
            name: ticket.summary
          });
        });
    });
    return function () {
      return Session.get('item');
    };
  },
  action: function () {
    Router.go('itemShow', {item_id: Session.get('item').id, item_type: 'ticket'});
  }
});

Router.route('home', {
  path: '/',
  action: function() {
    bootstrapLists();
    Router.go('listsShow', Lists.findOne({userId: Meteor.userId() }));
  }
});
