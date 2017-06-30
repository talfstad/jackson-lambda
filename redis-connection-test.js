const redis = require('redis');

const redisConfig = {
  // host: 'ec2-54-202-148-125.us-west-2.compute.amazonaws.com',
  host: 'localhost',
  // db: 1,
  // password: 'Wewillrockyou1986!',
};

const redisClient = redis.createClient(redisConfig);

redisClient.on('error', (e) => {
  console.log(`REDIS ERROR: ${e}`);
});

// first, get all out of date records and store in a var ?

// return array of rip objects.


// redisClient.set('test', 'test value');
// redisClient.expire('test', '5');

redisClient.keys('*', (err, keys) => {
  console.log(keys);
});
//
// redisClient.flushdb(() => {
//   console.log('deleted all keys');
// });

// results look like this: ['rip1', 'rip2', 'rip3', 'rip4']
// we want to look like this: [nowSeconds, 'rip1', nowSeconds, 'rip2', nowSeconds, 'rip3']

// const zadd = (inputs, cb) => {
//   redisClient.zadd('test:multi:zadd', inputs, cb);
// };
//

// redisClient.zadd('test:multi:zadd', [1, 'one', 2, 'two', 3, 'three'], () => {
// });

// redisClient.set('one', 'this is the rip data', () => {
//   redisClient.mget(['one', 'two', 'three'], () => {
//     console.log('mget:');
//     // console.log(item);
//   });
//
//
//   // lua script:
//   // 1. query out of date records
//   // 2. mget all of those keys and return them in array (parsed).
//   // 3. zadd those records with new date seconds (update to new seconds)
//   // TODO: zadd all of the out of date rip keys with the updated score.
//   // iterate through array and push item every other. push next, push, next
//   const newTime = moment().unix();
//
//   redisClient.eval(`
//     -- 1. Query all out of date records
//     local outOfDateRipKeys = redis.call("ZRANGEBYSCORE", "test:multi:zadd", "-inf", "+inf")
//     --
//     -- 2. Modify out of date results to update their score.
//     local updatedScoresInput = {}
//     for count = 1, #outOfDateRipKeys do
//       table.insert(updatedScoresInput, ${newTime})
//       table.insert(updatedScoresInput, outOfDateRipKeys[count])
//     end
//     --
//     -- 3. Update out of date scores
//     redis.call("ZADD", "test:multi:zadd", unpack(updatedScoresInput))
//     --
//     -- 4. Get all rip values for out of date rip keys and return them.
//     local outOfDateRips = redis.call("MGET", unpack(outOfDateRipKeys))
//     return outOfDateRips
//     `, '', (err, result) => {
//       console.log('query:');
//       // console.log(err);
//       console.log(result);
//
//       redisClient.zrangebyscore('test:multi:zadd', '-inf', '+inf', 'WITHSCORES', () => {
//         console.log('zrangebyscore:');
//         // console.log(results);
//       });
//     });
// });


// // redisClient.zrangebyscore('test:multi:zadd', '-inf', '+inf', 'WITHSCORES', (err, results) => {
//
// redisClient.zrangebyscore('test:multi:zadd', '-inf', '+inf', (err, results) => {
//   console.log(results);
//   // results look like this: ['one', 'two', 'three']
//   // make them look like this: [1, 'one', 2, 'two', 3, 'three']
//   const newTime = moment().unix();
//   const newResults = results.map(item => [newTime, item]);
//
//   const newInputs = _.flatten(newResults);
//   zadd(newInputs, () => {
//     redisClient.zrangebyscore(
// 'test:multi:zadd', '-inf', '+inf', 'WITHSCORES', (err, results) => {
//       console.log(results);
//     });
//   });
// });


// test watch
//
// redisClient.set('testrip.com', 'initial', (er) => {
//   console.log('ok dude');
//   console.log(er);
//   redisClient.watch('testrip.com', (errr) => {
//     console.log('yup now');
//     console.log(errr);
//     redisClient.set('testrip.com', 'changed', (err) => {
//       console.log('changed');
//       console.log(err);
//
//       const multi = redisClient.multi();
//       multi.set('testrip.com', 'shouldnt work');
//       multi.exec((e, replies) => {
//         console.log('final ->');
//         console.log(e);
//         console.log(replies); // IF THIS IS NULL THEN WE FAILED. If it is [ 'OK' ] success
//       });
//     });
//   });
// });
