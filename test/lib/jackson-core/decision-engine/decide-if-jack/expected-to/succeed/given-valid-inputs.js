import DecisionEngine from '../../../../../../../lib/jackson-core/lib/decision-engine';
import RedisDao from '../../../../../../../lib/jackson-core/lib/dao/redis-dao';
import Config from '../../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('DecisionEngine', () => {
      describe('decideIfTake', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });
          const ip = '2602:304:ce3e:27f0:1e:abc8:9568:8b1';

          // Will take 100% by default. no conditions are met
          const decisionInformation = {
            userConfig: {
              last_updated: new Date(),
              min_daily_hits_to_take: 4,
              min_minutes_consecutive_traffic: 3,
              min_hits_per_min_to_take: 10,
            },
            requestInputs: {
              uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
              ip,
              url: 'https://some-lander.com/landingpage.html',
              geo: { country: 'US' },
            },
            updatedRipRecord: {
              take_rate: 0.3,
              offer: {
                _id: 'offer-id',
                url: 'http://testurl.com',
              },
              hits_per_min: 15,
              consecutive_min_traffic: 5,
              archive: {
                hourly: [
                  {
                    hour: 0,
                    hits: [
                      { cc: 'US', hits: 10 },
                    ],
                  },
                ],
              },
            },
          };

          before((done) => {
            // Remove redis key for IP whitelist as precaution
            const redisDao = new RedisDao({ config: config.redisDaoConfig() });

            redisDao.delKey(ip)
              .then(() => redisDao.closeConnection())
              .then(() => done())
              .catch(err => done(err));
          });

          it('Take if all expected conditions are met (100%)', (done) => {
            const db = new Dao({ config });
            new DecisionEngine({ db }).decideIfTake(decisionInformation)
              .then(() => db.closeConnection())
              .then(() => {
                done();
              })
              .catch(err => done(err));
          });
        });
      });
    });
  });
});
