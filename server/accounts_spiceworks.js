ServiceConfiguration.configurations.remove({
  service: 'spiceworks'
});
ServiceConfiguration.configurations.insert({
  service: 'spiceworks',
  appId: Meteor.settings.public.spiceworksAppId,
  appSecret: Meteor.settings.spiceworksAppSecret
});
