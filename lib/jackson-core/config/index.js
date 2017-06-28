const Config = ({ stageVariables = {} }) => ({
  ghostClickPercentage:
    stageVariables.ghostClickPercentage ||
    process.env.ghostClickPercentage ||
    0.5,

  redisDaoConfig() {
    // Change the last one to contain default configuration
    return {
      url: stageVariables.redisDaoConfigUrl ||
            process.env.redisDaoConfigUrl ||
            'redis://admin:Wewillrockyou1986!@ec2-54-202-148-125.us-west-2.compute.amazonaws.com:6379/1',
      maxRetries: 5,
      expireClientIPEveryNSeconds:
        stageVariables.expireClientIPEveryNSeconds ||
        process.env.expireClientIPEveryNSeconds ||
        (60 * 60 * 24), // 24 hours. 60 seconds in a min. 60 min in hour. 24 hours
      clearUserConfigFromCacheEveryNMinutes:
        stageVariables.clearUserConfigFromCacheEveryNMinutes ||
        process.env.clearUserConfigFromCacheEveryNMinutes ||
        5,
      clearOutdatedRipsFromCacheEveryNHours:
        stageVariables.clearOutdatedRipsFromCacheEveryNHours ||
        process.env.clearOutdatedRipsFromCacheEveryNHours ||
        24,
    };
  },

  mongoDaoConfig() {
    // Change this one to contain default configuration
    return {
      host: stageVariables.mongoDaoConfigHost ||
            process.env.mongoDaoConfigHost ||
            'mongodb://jackson:Wewillrockyou1986!@ds153761-a0.mlab.com:53761,ds153761-a1.mlab.com:53761/test?replicaSet=rs-ds153761',
      persistRipEveryNSeconds:
        stageVariables.persistRipEveryNSeconds ||
        process.env.persistRipEveryNSeconds ||
        5,
    };
  },
});

export default Config;
