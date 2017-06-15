import {
    expect,
} from 'chai';

import MongoDao from '../../../../../lib/jackson-core/lib/dao/mongo-dao';
import RedisDao from '../../../../../lib/jackson-core/lib/dao/redis-dao';
import Config from '../../../../../lib/jackson-core/config';

import lambda from '../../../../../src';

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

    let mongoDao = null;
    let redisDao = null;

    before((done) => {
      redisDao = new RedisDao({
        config: new Config({ stageVariables: validEvent.stageVariables }).redisDaoConfig(),
      });
      mongoDao = new MongoDao({
        config: new Config({ stageVariables: validEvent.stageVariables }).mongoDaoConfig(),
      });

      // delete rip from redis
      redisDao.delKey(ripUrl)
        // delete rip from mongo
        .then(() => mongoDao.removeRip(ripUrl))
        .then(() => {
          redisDao.closeConnection();
          mongoDao.closeConnection();
          done();
        });
    });

    after((done) => {
      // Delete test rip from redis
      redisDao.delKey(ripUrl)
        // Delete test rip from redis
        .then(() => mongoDao.removeRip(ripUrl))
        .then(() => {
          redisDao.closeConnection();
          mongoDao.closeConnection();
          done();
        });
    });

    it('Redirect if brand new rip', (done) => {
      // A redirect happens in the decision information aggregator
      // when a URL doesn't exist in Redis, or in Mongo. A new rip is created
      // and saved with the url and the user is forwarded since we never
      // jack on the first hit.
      lambda.handler(validEvent, {}, (err, response) => {
        try {
          expect(err).to.equal(null);
          const {
            headers = {},
          } = response;
          expect(headers.Location).to.equal('https://github.com/jquery/dist');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
