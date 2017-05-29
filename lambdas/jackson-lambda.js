const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  AWS.config.loadFromPath('./config/aws.json');

  const { alias } = event.params;

  console.log(alias);
  console.log('^ alias');
  const lambda = new AWS.Lambda();

  const jacksonCoreConfig = {
    FunctionName: 'jackson-core',
    Payload: JSON.stringify({}),
    InvocationType: 'Event',
    Qualifier: alias,
  };

  lambda.invoke(jacksonCoreConfig, (err, data) => {
    console.log(err);
    console.log(data);
    if (err) {
      callback(err);
    } else {
      callback(false, data);
    }
  });
};
