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

redisClient.keys('*', (err, keys) => {
  console.log(err);
  console.log(keys);
});

redisClient.del('994c3823-aff6-f548-ce9b-1b5df2ac267c', () => {
  console.log('deleted the uuid');
});

redisClient.del('whitelistedDomains', (err, data) => {
  console.log('deleted whitelisted domains test');
  if (err) console.log(err);
  else console.log(data);
});

redisClient.del('undefined', (err, data) => {
  console.log('deleted undefined key');
  if (err) console.log(err);
  else console.log(data);
});

redisClient.del('http://somewebsite.com', (err, data) => {
  console.log('deleted http://somewebsite.com key');
  if (err) console.log(err);
  else console.log(data);
});

redisClient.del('https://some-lander.com/landingpage.html', (err, data) => {
  console.log('deleted https://some-lander.com/landingpage.html key');
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
