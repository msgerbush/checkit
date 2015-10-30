Accounts.oauth.registerService('spiceworks');

if (Meteor.isClient) {
  Meteor.loginWithSpiceworks = function(options, callback) {
    // support a callback without options
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Spiceworks.requestCredential(options, credentialRequestCompleteCallback);
  };
} else {
  Accounts.addAutopublishFields({
    forLoggedInUser: ['services.spiceworks'],
    forOtherUsers: [
      'services.spiceworks.firstName',
      'services.spiceworks.lastName'
    ]
  });
}
