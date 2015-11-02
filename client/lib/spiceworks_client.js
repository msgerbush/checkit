Spiceworks = {};

// Request Spiceworks credentials for the user
//
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Spiceworks.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'spiceworks'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  var credentialToken = Random.secret();
  var login = new SW.Login({appUid: config.appId});
  var token;

  login.request('login').then(
    function(access_token){
      token = access_token;
      return card.services('environment').request('environment');
    }).then(function (env) {
      var user = env.user;
      HTTP.get('/_oauth/spiceworks', {
        params: {
          user_email: user.email,
          user_first_name: user.first_name,
          user_last_name: user.last_name,
          user_sw_auid: user.user_auid,
          host_auid: env.app_host.auid,
          access_token: token,
          state: credentialToken
        }
      }, function (error, result) {
        var config;
        if(error){
          return credentialRequestCompleteCallback(error);
        }

        config = JSON.parse(result.content);
        if (config.setCredentialToken) {
          OAuth._handleCredentialSecret(config.credentialToken,
            config.credentialSecret);
        }
        return credentialRequestCompleteCallback(config.credentialToken);
      });
    });
};
