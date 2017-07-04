import {
    expect,
} from 'chai';

import Config from '../../../../../lib/jackson-core/config';
import Dao from '../../../../../lib/jackson-core/lib/dao';
import Runner from '../../../../../src/runner';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    const validEvent = {
      path: '/jquery/dist',
      httpMethod: 'GET',
      headers: {
        Host: 'github-cdn.com',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
        'X-Alt-Referer': 'http://yourtrendingnews.com/lebron/?txid=994c3823-aff6-f548-ce9b-1b5df2ac267c',
        Referer: 'https://www.test-whitelisted-domain.com',
      },
      stageVariables: {
        redirectHost: 'github.com',
        alias: 'test',
      },
    };

    const config = new Config({ stageVariables: {} });

    before((done) => {
      const db = new Dao({ config });
      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();

      // clear out redis whitelisted_domains to start fresh
      redisDao.delWhitelistedDomains()
        // add domain to whitelisted collection in mongo
        .then(() => mongoDao.whitelistDomain('www.test-whitelisted-domain.com'))
        .then(() => db.closeConnection())
        .then(() => {
          done();
        });
    });

    after((done) => {
      const db = new Dao({ config });
      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();


      // clean up whitelistedDomains in redis from test
      redisDao.delWhitelistedDomains()
        // clean up test domain from whitelisted_domains collection
        .then(() => mongoDao.removeWhitelistedDomain('www.test-whitelisted-domain.com'))
        .then(() => db.closeConnection())
        .then(() => {
          done();
        });
    });

    it('Redirect if domain is whitelisted', (done) => {
      // To test if domain is whitelisted we need to get far along
      // enough to get into the request validator. So, we need to make sure
      // We offer valid inputs but we don't need to offer more input than
      // that since we should never get to the decision engine
      // or need more information.
      const db = new Dao({ config });

      Runner.run({
        db,
        event: validEvent,
        context: {},
        callback: (err, response) => {
          try {
            expect(err).to.equal(null);
            const {
              headers = {},
            } = response;
            expect(headers.Location).to.equal('https://github.com/jquery/dist');
            db.closeConnection()
              .then(() => done());
          } catch (e) {
            done(e);
          }
        },
      });
    });
  });
});
