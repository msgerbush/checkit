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

if (Meteor.isClient) {
  Router.onBeforeAction('loading');
  Router.onBeforeAction('dataNotFound');

  Router.onBeforeAction(function () {
    if (Accounts.loginServicesConfigured() && !Meteor.userId()) {
      Meteor.loginWithSpiceworks();
      this.render('appAuthenticating');
    } else {
      this.next();
    }
  });

  Router.onBeforeAction(function () {
    var data = [
      {title: "Meteor Principles",
       items: ["Data on the Wire",
         "One Language",
         "Database Everywhere",
         "Latency Compensation",
         "Full Stack Reactivity",
         "Embrace the Ecosystem",
         "Simplicity Equals Productivity"
       ]
      },
      {title: "Languages",
       items: ["Lisp",
         "C",
         "C++",
         "Python",
         "Ruby",
         "JavaScript",
         "Scala",
         "Erlang",
         "6502 Assembly"
         ]
      },
      {title: "Favorite Scientists",
       items: ["Ada Lovelace",
         "Grace Hopper",
         "Marie Curie",
         "Carl Friedrich Gauss",
         "Nikola Tesla",
         "Claude Shannon"
       ]
      }
    ];

    var timestamp = (new Date()).getTime();
    var userId = Meteor.userId();

    if (Lists.find({userId: userId}).count() === 0) {
      _.each(data, function(list) {
        var list_id = Lists.insert({
          title: list.title,
          incompleteCount: list.items.length,
          userId: userId
        });

        _.each(list.items, function(text) {
          Todos.insert({listId: list_id,
                        text: text,
                        createdAt: new Date(timestamp)});
          timestamp += 1; // ensure unique timestamp.
        });
      });
    }

    this.next();
  });
}

Router.route('listsShow', {
  path: '/lists/:_id',
  onBeforeAction: function () {
    this.todosHandle = Meteor.subscribe('todos', this.params._id);
    this.next();
  },
  data: function () {
    return Lists.findOne(this.params._id);
  },
  action: function () {
    this.render();
  }
});

Router.route('home', {
  path: '/',
  action: function() {
    Router.go('listsShow', Lists.findOne());
  }
});
