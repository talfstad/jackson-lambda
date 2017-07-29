import {
    expect,
} from 'chai';
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
            uuid: '3.2.1',
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
            const db = new Dao({ config });
            const redisDao = db.getRedisDao();

            // Defaults to current time which will be current and will not persist
            db.createRip(rip, { country: 'US' })
              .then(() => redisDao.updateRipLastPersistedDate(rip.url))
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

          it('Not persist rip if current', (done) => {
            const db = new Dao({ config });
            const mongoDao = db.getMongoDao();

            db.persistRipIfOutdated({
              ...rip,
              hits_per_min: 50,
            })
              .then(() => mongoDao.getRip(rip.url))
              .then((queriedRip) => {
                expect(queriedRip.hits_per_min).to.equal(25);
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
