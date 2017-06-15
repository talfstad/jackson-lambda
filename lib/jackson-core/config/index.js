const Config = ({ stageVariables = {} }) => ({
  redisDaoConfig() {
    // Change the last one to contain default configuration
    return {
      url: stageVariables.redisDaoConfigUrl ||
            process.env.redisDaoConfigUrl ||
            'redis://admin:Wewillrockyou1986!@ec2-54-202-148-125.us-west-2.compute.amazonaws.com:6379/1',
    };
  },

  mongoDaoConfig() {
    // Change this one to contain default configuration
    return {
      host: stageVariables.mongoDaoConfigHost ||
            process.env.mongoDaoConfigHost ||
            'mongodb://jackson:Wewillrockyou1986!@ds153761-a0.mlab.com:53761,ds153761-a1.mlab.com:53761/test?replicaSet=rs-ds153761',
    };
  },
});

export default Config;
