import MongoDao from '../../../../../../../lib/jackson-core/lib/dao/mongo-dao/mongodb';
import Config from '../../../../../../../lib/jackson-core/config';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('MongoDB Dao', () => {
      describe('Expected to', () => {
        const config = Config({ stageVariables: {} });
        const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

        const geo = { country: 'US' };
        // Rip has no UUID
        const rip = {
          url: 'some-lander.com/land123ingpage.html',
          take_rate: 0,
          offer: {
            _id: 'offer-ifd',
            url: 'http://testurl.com',
          },
          hits_per_min: 15,
          consecutive_min_traffic: 5,
          archive: {
            hourly: [
              {
                hour: 0,
                hits: [
                      { cc: geo.country, hits: 100 },
                ],
              },
            ],
          },
        };

        it('fail to create rip if no uuid key', (done) => {
          mongoDao.createRip(rip, geo)
            .then(() => {
              done(new Error('Should not have created new Rip.'));
            })
            .catch(() => {
              done();
            });
        });
      });
    });
  });
});
