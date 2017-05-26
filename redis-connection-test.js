const redis = require('redis');

const redisConfig = {
  host: 'rs.1w3aii.0001.use1.cache.amazonaws.com',
  db: 1,
};

const redisClient = redis.createClient(redisConfig);

redisClient.on('error', (e) => {
  console.log(`REDIS ERROR: ${e}`);
});

redisClient.set('test', 'test value');
redisClient.expire('test', '5');

redisClient.get('test', (err, data) => {
  console.log('immediate test');
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
