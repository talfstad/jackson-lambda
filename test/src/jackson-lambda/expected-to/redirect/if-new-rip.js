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
        Referer: 'http://if-new-rip.org/this/landingpage.html',
      },
      stageVariables: {
        redirectHost: 'github.com',
        alias: 'test',
      },
    };

    const ripUrl = 'if-new-rip.org/this/landingpage.html';

    const config = new Config({ stageVariables: validEvent.stageVariables });

    before((done) => {
      const db = new Dao({ config });
      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();

      // delete rip from redis
      redisDao.delKey(ripUrl)
        // delete rip from mongo
        .then(() => mongoDao.removeRip(ripUrl))
        .then(() => db.closeConnection())
        .then(() => {
          done();
        });
    });

    after((done) => {
      const db = new Dao({ config });
      const redisDao = db.getRedisDao();
      const mongoDao = db.getMongoDao();

      // Delete test rip from redis
      redisDao.delKey(ripUrl)
        // Delete test rip from redis
        .then(() => mongoDao.removeRip(ripUrl))
        .then(() => db.closeConnection())
        .then(() => {
          done();
        });
    });

    it('Redirect if brand new rip', (done) => {
      // A redirect happens in the decision information aggregator
      // when a URL doesn't exist in Redis, or in Mongo. A new rip is created
      // and saved with the url and the user is forwarded since we never
      // jack on the first hit.
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
