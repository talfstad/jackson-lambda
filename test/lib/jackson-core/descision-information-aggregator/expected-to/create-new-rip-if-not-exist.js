import {
    expect,
} from 'chai';

import Config from '../../../../../lib/jackson-core/config';

// Used for test set up tear down
import MongoDao from '../../../../../lib/jackson-core/lib/dao/mongo-dao';
import RedisDao from '../../../../../lib/jackson-core/lib/dao/redis-dao';

import DecisionInformationAggregator from '../../../../../lib/jackson-core/lib/decision-information-aggregator';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Decision Information Aggregator', () => {
      describe('Expected to', () => {
        // DecisionInformationAggregator only uses the UUID and URL
        const uuid = '554c3354-aff6-f548-1234-1b5df2ac267c';
        const url = 'http://somelandingpagedomain.com/some-landing-page.html';

        const config = Config({ stageVariables: {} });

        before((done) => {
          // delete rip from mongo
          // delete rip from redis
          const redisDao = new RedisDao({ config: config.redisDaoConfig() });
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          mongoDao.removeRip(url)
          .then(() => redisDao.delKey(url))
          .then(() => mongoDao.closeConnection())
          .then(() => redisDao.closeConnection())
          .then(() => {
            done();
          });
        });

        after((done) => {
          // delete rip from mongo

          const redisDao = new RedisDao({ config: config.redisDaoConfig() });
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          redisDao.delKey(url)
          .then(() => mongoDao.removeRip(url))
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          })
          .catch(() => done());
        });

        it('Create a new rip record if not exist and save it to mongo', (done) => {
          // We don't need a user since this should create a rip before we look up config.
          // Aggregate will get the rip first, create one if none, then get userConfig.
          // This also should NOT store any config or do any config queries. That's why
          // we pass UUID but don't take the time to create a testUser in the DB. It should
          // fail before that.

          const descisionInformationAggregator = new DecisionInformationAggregator({ config });
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          descisionInformationAggregator.aggregate({ url, uuid })
            .then(() => {
              throw new Error('Should not resolve aggregate function on new rip.');
            })
            .catch(() => {
              // expect rip to be in mongo now
              mongoDao.getRip(url)
                .then((ripFromMongo) => {
                  mongoDao.closeConnection()
                    .then(() => {
                      try {
                        expect(ripFromMongo).to.not.equal(undefined);
                        done();
                      } catch (err) {
                        done(err);
                      }
                    })
                    .catch(err => done(err));
                })
                .catch(e => done(e));
            });
        });
      });
    });
  });
});
