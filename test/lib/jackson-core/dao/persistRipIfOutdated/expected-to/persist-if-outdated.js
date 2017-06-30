import {
    expect,
} from 'chai';
import moment from 'moment';
import Config from '../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Dao', () => {
      describe('persistRipIfOutdated', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });

          const rip = {
            _id: '5955df0e2822631ad0f44919',
            uuid: '554c3823-aff6-f548-ce9b-1b5df2ac267c',
            url: 'testrip.com',
            take_rate: 0.3,
            offer: {
              _id: 'offer-id',
              url: 'http://testurl.com',
            },
            hits_per_min: 25,
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

          before((done) => {
            // To set up rip to be persisted we must make sure it is
            // out of date. That means we'll take 24 hours off of now
            // and store it in the sorted set. Then it should persist it.
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();

            const outdatedTime = moment().subtract(2, 'days').unix();
            db.createRip(rip, { country: 'US' })
              .then(() => redisDao.updateRipLastPersistedDate(rip.url, outdatedTime))
              .then(() => db.closeConnection())
              .then(() => done())
              .catch(err => done(err));
          });

          after((done) => {
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();
            const mongoDao = db.getMongoDao();

            redisDao.delKey(rip.url)
              .then(() => mongoDao.removeRip(rip.url))
              .then(() => db.closeConnection())
              .then(() => done());
          });

          it('Persist rip if outdated', (done) => {
            const db = new Dao({ config });
            const mongoDao = db.getMongoDao();

            db.persistRipIfOutdated({
              ...rip,
              hits_per_min: 50,
            })
              .then(() => mongoDao.getRip(rip.url))
              .then((queriedRip) => {
                expect(queriedRip.hits_per_min).to.equal(50);
                db.closeConnection()
                  .then(() => done());
              })
              .catch(err => done(err));
          });
        });
      });
    });
  });
});
