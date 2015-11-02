var bootstrapLists = function () {
  var data = [
    {title: "Meteor Principles",
     todos: [
       {text: "Data on the Wire"},
       {text: "One Language"},
       {text: "Database Everywhere"},
       {text: "Latency Compensation"},
       {text: "Full Stack Reactivity"},
       {text: "Embrace the Ecosystem"},
       {text: "Simplicity Equals Productivity"}
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

var bootstrapItemList = function (item) {
  var itemListsCount = Lists.find({
    userId: Meteor.userId(),
    linkedItems: { $elemMatch: {type: item.type, id: item.id}}
  }).count();
  if (itemListsCount === 0) {
    Meteor.call('createList', {
      title: Lists.defaulTitle(),
      linkedItems:[{
        id: item.id,
        type: item.type,
        name: item.name
      }]
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

userReadyHold = null;
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
  path: '/lists/:_id',
  onBeforeAction: function () {
    this.todosHandle = Meteor.subscribe('todos', this.params._id);
  },
  data: function () {
    return Lists.findOne(this.params._id);
  },
  action: function () {
    this.render('fullPagePlacement');
  }
});

Router.route('itemListsShow', {
  path: '/:item_type/:_id/list/:list_id',
  onBeforeAction: function () {
    this.todosHandle = Meteor.subscribe('todos', this.params.list_id);
  },
  data: function () {
    var list = Lists.findOne(this.params.list_id);
    var itemId = this.params._id;
    var itemType = this.params.item_type;
    var item = _.find(list.linkedItems, function (linkedItem) {
      return linkedItem.type === itemType && linkedItem.id === itemId;
    });
    return {
      list: list,
      item: item
    };
  },
  action: function () {
    this.render('itemPlacement');
  }
});

Router.route('ticketsShow', {
  path: '/tickets/:_id',
  waitOn: function () {
    card.services('helpdesk').request('ticket', parseInt(this.params._id))
    .then(function (ticket) {
      Session.set({
        itemName: ticket.summary,
        itemType: 'ticket'
      });
    });
    return [function () {
      return Session.get('itemName');
    },function () {
      return Session.get('itemType');
    }];
  },
  action: function () {
    bootstrapItemList({
      type:'ticket',
      id: this.params._id,
      name: Session.get('itemName')});
    Router.go('itemListsShow', {
      _id: this.params._id,
      item_type: 'ticket',
      list_id: Lists.findOne({
        userId: Meteor.userId(),
        linkedItems: {$elemMatch: {type: 'ticket', id: this.params._id}}
      })._id
    });
  }
});

Router.route('devicesShow', {
  path: '/devices/:_id',
  waitOn: function () {
    card.services('inventory').request('device', parseInt(this.params._id))
    .then(function (device) {
      Session.set({
        itemName: device.name,
        itemType: 'device'
      });
    });
    return [function () {
      return Session.get('itemName');
    },function () {
      return Session.get('itemType');
    }];
  },
  action: function () {
    bootstrapItemList({
      type:'device',
      id: this.params._id,
      name: Session.get('itemName')});
    Router.go('itemListsShow', {
      _id: this.params._id,
      item_type: 'device',
      list_id: Lists.findOne({
        userId: Meteor.userId(),
        linkedItems: {$elemMatch: {type: 'device', id: this.params._id}}
      })._id
    });
  }
});

Router.route('devices', {
  path: '/devices',
  waitOn: function () {
    card.services('inventory').on('device:show', function (deviceId) {
      Session.set('itemId', deviceId.toString());
    });
    return function () {
      return Session.get('itemId');
    };
  },
  action: function () {
    Router.go('devicesShow', {_id: Session.get('itemId')});
  }
});

Router.route('tickets', {
  path: '/tickets',
  waitOn: function () {
    card.services('helpdesk').on('showTicket', function (ticketId) {
      Session.set('itemId', ticketId.toString());
    });
    return function () {
      return Session.get('itemId');
    };
  },
  action: function () {
    Router.go('ticketsShow', {_id: Session.get('itemId')});
  }
});

Router.route('home', {
  path: '/',
  action: function() {
    bootstrapLists();
    Router.go('listsShow', Lists.findOne({userId: Meteor.userId() }));
  }
});
