import OptimisticUpdater from '../../../../../../lib/jackson-core/lib/optimistic-updater';
import Config from '../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Dao', () => {
      describe('updateRipInRedisWithRetry', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });

          const updatedRipRecord = {
            url: 'testrip.com',
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
                {
                  hour: 20,
                  hits: [
                    { cc: 'US', hits: 10 },
                  ],
                },
              ],
            },
          };

          after((done) => {
            // Break down test. delete rip key from redis.
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();

            redisDao.delKey('testrip.com')
              .then(() => db.closeConnection())
              .then(() => done());
          });

          it('Update rip in redis after 1 retry', (done) => {
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();

            // Test start
            const runTest = () => {
              db.updateRipInRedisWithRetry({
                updatedRipRecord: { ...updatedRipRecord, trev: 'hottie' },
                jackDecision: true,
                optimisticUpdater: new OptimisticUpdater({ geo: { country: 'US' } }),
              })
              .then(() => db.closeConnection())
              .then(() => done())
              .catch(err => done(err));
            };

            // Before set up needs to be part of test because
            // needs same connectin.
            redisDao.setRipAndWatch(updatedRipRecord)
              .then(() => redisDao.setKeyWithObjectValue('testrip.com', {
                ...updatedRipRecord,
                take_rate: 1,
              }))
              .then(() => runTest());
          });
        });
      });
    });
  });
});
