const redis = require('redis');

const redisConfig = {
  host: 'ec2-54-202-148-125.us-west-2.compute.amazonaws.com',
  db: 1,
  password: 'Wewillrockyou1986!',
};

const redisClient = redis.createClient(redisConfig);

redisClient.on('error', (e) => {
  console.log(`REDIS ERROR: ${e}`);
});

redisClient.set('test', 'test value');
redisClient.expire('test', '5');

redisClient.del('whitelistedDomains', (err, data) => {
  console.log('deleted whitelisted domains test');
  if (err) console.log(err);
  else console.log(data);
});

setTimeout(() => {
  redisClient.get('test', (err, data) => {
    console.log('delayed test');
    if (err) console.log(err);
    else console.log(data);
  });
}, 6000);
