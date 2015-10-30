Spiceworks = {};

OAuth._endOfLoginResponse = function (res, details) {
  var json;
  res.writeHead(200, {'Content-Type': 'application/json'});

  if (details.error) {
    Log.warn("Error in OAuth Server: " +
             (details.error instanceof Error ?
              details.error.message : details.error));
    json = JSON.stringify({
      setCredentialToken: false
    });
    res.end(json);
    return;
  }

  // If we have a credentialSecret, report it back to the parent
  // window, with the corresponding credentialToken. The parent window
  // uses the credentialToken and credentialSecret to log in over DDP.
  json = JSON.stringify({
    setCredentialToken: true,
    credentialToken: details.credentials.token,
    credentialSecret: details.credentials.secret,
    storagePrefix: escape(OAuth._storageTokenPrefix)
  });
  res.end(json);
};

OAuth.registerService('spiceworks', 2, null, function(query) {
  var response = getTokenResponse(query);

  var serviceData = {
    id: response.swUserAuid,
    swHostAuid: response.swHostAuid,
    swUserAuid: response.swUserAuid,
    firstName: query.user_first_name,
    lastName: query.user_last_name,
    email: query.user_email
  };

  return {
    serviceData: serviceData
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'spiceworks'});
  if (!config) {
      throw new ServiceConfiguration.ConfigError('Service not configured');
  }

  var responseContent;

  try {
    // Request an access token
    responseContent = HTTP.get(
      'https://frontend.spiceworks.com/appcenter/api/app_user_authorization.json', {
        params: {
          access_token: query.access_token,
          app_secret: OAuth.openSecret(config.appSecret),
          host_auid: query.host_auid,
          user_auid: query.user_sw_auid
        }
      }).content;
  } catch (err) {
    throw _.extend(new Error('Failed to complete OAuth handshake with Spiceworks. ' + err.message),
      {response: err.response});
  }

  // Success!
  var parsedResponse = JSON.parse(responseContent);
  var swHostAuid = parsedResponse.authorization.host_auid;
  var swUserAuid = parsedResponse.authorization.user_auid;

  return {
    swHostAuid: swHostAuid,
    swUserAuid: swUserAuid
  };
};

Spiceworks.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
