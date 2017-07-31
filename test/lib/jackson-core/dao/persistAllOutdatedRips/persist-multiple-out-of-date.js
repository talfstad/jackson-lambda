import {
    expect,
} from 'chai';
import moment from 'moment';
import Config from '../../../../../lib/jackson-core/config';
import Dao from '../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Dao', () => {
      describe('persistAllOutdatedRips', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });

          const rip = {
            _id: '5955df0e2822631ad0f44919',
            uuid: '3.2.1',
            url: 'testrip.com',
            take_rate: 0.3,
            offer: {
              _id: 'offer-id',
              url: 'http://testurl.com',
            },
            hits_per_min: 25,
            consecutive_min_traffic: 5,
            daily_hits: 100,
            daily_jacks: 0,
            host: 'test.cdnjs.io',
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

          before((done) => {
            const outdatedTime = moment().subtract(2, 'days').unix();

            const db = new Dao({ config });
            const redisDao = db.getRedisDao();
            // Create 2 rips that are out of date. Test that they are
            // both persisted and deleted from the sorted set.
            const firstRip = {
              ...rip,
              _id: '6055df0e2822631ad0f44919',
              url: 'testurl1.com',
            };

            const secondRip = {
              ...rip,
              url: 'testurl2.com',
            };

            db.createRip(firstRip, { country: 'US' })
              .then(() => db.createRip(secondRip, { country: 'US' }))
              // Make rips out of date
              .then(() => redisDao.updateRipLastPersistedDate('testurl2.com', outdatedTime))
              .then(() => redisDao.updateRipLastPersistedDate('testurl1.com', outdatedTime))
              // Change redis value of rip so we know if it's written to mongo
              .then(() => redisDao.setKeyWithObjectValue('testurl2.com', { ...secondRip, hits_per_min: 50 }))
              .then(() => redisDao.setKeyWithObjectValue('testurl1.com', { ...firstRip, hits_per_min: 50 }))
              .then(() => db.closeConnection())
              .then(() => done())
              .catch(err => done(err));
          });

          after((done) => {
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();
            const mongoDao = db.getMongoDao();

            redisDao.delKey('testurl1.com')
              .then(() => mongoDao.removeRip('testurl1.com'))
              .then(() => redisDao.delKey('testurl2.com'))
              .then(() => mongoDao.removeRip('testurl2.com'))
              .then(() => db.closeConnection())
              .then(() => done());
          });

          it('Persist multiple out of date', (done) => {
            const db = new Dao({ config });
            const mongoDao = db.getMongoDao();

            db.persistAllOutdatedRips()
              .then(() => mongoDao.getRip('testurl1.com'))
              .then((queriedRip1) => {
                mongoDao.getRip('testurl2.com')
                  .then((queriedRip2) => {
                    expect(queriedRip1.hits_per_min).to.equal(50);
                    expect(queriedRip2.hits_per_min).to.equal(50);
                    db.closeConnection()
                    .then(() => done());
                  });
              })
              .catch(err => done(err));
          });
        });
      });
    });
  });
});
