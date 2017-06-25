import {
    expect,
} from 'chai';

import Config from '../../../../../lib/jackson-core/config';
import Dao from '../../../../../lib/jackson-core/lib/dao';

// Used for test set up tear down
import MongoDao from '../../../../../lib/jackson-core/lib/dao/mongo-dao';
import RedisDao from '../../../../../lib/jackson-core/lib/dao/redis-dao';

import DecisionInformationAggregator from '../../../../../lib/jackson-core/lib/decision-information-aggregator';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Decision Information Aggregator', () => {
      describe('Expected to', () => {
        // DecisionInformationAggregator only uses the UUID and URL and GEO
        const uuid = '554c3354-aff6-f548-1234-1b5df2ac267c';
        const url = 'http://somelandingpagedomain.com/some-landing-page.html';
        const geo = { country: 'US' };

        const testUser = {
          _id: '6240a8e8b5cabc3836c14593',
          name: 'Test User',
          email: 'testuser@gmail.com',
          created_on: new Date(),
          last_updated: new Date(),
          uuids: [
          { uuid },
          ],
          config: {
            last_updated: new Date(),
            min_minutes_consecutive_traffic: 0,
            min_daily_hits_to_take: 0,
            min_hits_per_min_to_take: 0,
          },
        };

        const config = Config({ stageVariables: {} });

        before((done) => {
          // Clear out any chance of old information
          // before we start the test
          const redisDao = new RedisDao({ config: config.redisDaoConfig() });
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          mongoDao.removeRip(url)
          .then(() => redisDao.delKey(url))
          .then(() => mongoDao.removeUser(testUser))
          .then(() => redisDao.delKey(testUser._id))
          .then(() => mongoDao.closeConnection())
          .then(() => redisDao.closeConnection())
          .then(() => {
            done();
          });
        });

        beforeEach((done) => {
          // Set up rip in mongo
          // create user for decision information aggregator
          // to use to get config by UUID
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          mongoDao.createRip({ url, uuid }, geo)
          .then(() => mongoDao.createUser(testUser))
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          })
          .catch(() => done());
        });

        afterEach((done) => {
          // delete rip from redis
          // delete rip from mongo
          // delete test user from mongo
          // delete config from redis
          const redisDao = new RedisDao({ config: config.redisDaoConfig() });
          const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

          redisDao.removeRip(url)
          .then(() => mongoDao.removeRip(url))
          .then(() => mongoDao.removeUser(testUser))
          .then(() => redisDao.delKey(testUser._id))
          .then(() => redisDao.closeConnection())
          .then(() => mongoDao.closeConnection())
          .then(() => {
            done();
          })
          .catch(() => done());
        });

        it('Cache rip records from mongo in redis', (done) => {
          const db = new Dao({ config });
          const descisionInformationAggregator =
            new DecisionInformationAggregator({ db });
          const redisDao = new RedisDao({ config: config.redisDaoConfig() });

          descisionInformationAggregator.aggregate({ url, uuid, geo })
            .then(() => {
              // expect rip to be in redis now
              redisDao.getRip(url)
                .then((ripFromRedis) => {
                  redisDao.closeConnection()
                    .then(() => {
                      try {
                        expect(ripFromRedis).to.not.equal(undefined);
                        done();
                      } catch (err) {
                        done(err);
                      }
                    })
                    .catch(err => done(err));
                });
            })
            .then(() => db.closeConnection());
        });

        it('Cache user configuration from mongo in redis', (done) => {
          const db = new Dao({ config });
          const descisionInformationAggregator =
            new DecisionInformationAggregator({ db });
          const redisDao = new RedisDao({ config: config.redisDaoConfig() });

          descisionInformationAggregator.aggregate({ url, uuid, geo })
            .then(() => {
              // expect config to be in mongo
              redisDao.getUserConfig(testUser._id)
                .then((userConfigFromRedis) => {
                  redisDao.closeConnection()
                    .then(() => {
                      try {
                        expect(userConfigFromRedis).to.not.equal(undefined);
                        expect(Object.keys(userConfigFromRedis).length).to.not.equal(0);
                        done();
                      } catch (err) {
                        done(err);
                      }
                    })
                    .catch(err => done(err));
                })
                .catch(err => done(err));
            })
            .then(() => db.closeConnection());
        });
      });
    });
  });
});
