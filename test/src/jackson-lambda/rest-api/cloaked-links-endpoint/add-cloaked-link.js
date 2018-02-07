import {
    expect,
    assert,
} from 'chai';

import Config from '../../../../../lib/jackson-core/config';
import Dao from '../../../../../lib/jackson-core/lib/dao';
import Runner from '../../../../../src/runner';

describe('Jackson Lambda', () => {
  describe('REST API', () => {
    describe('Current Offer', () => {
      describe('a valid request will add the current offer to the correct rip', () => {
        const domain = 'www.testdomaintoaddcurrentoffer.com';
        const url = `${domain}/lander1.html`;
        const currentOffer = 'http://currentofferrunning.com/hereistheoffer.html';

        const validEvent = {
          path: '/api/current-offer',
          httpMethod: 'POST',
          headers: {
            Host: 'github-cdn.com',
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
          },
          stageVariables: {
            redirectHost: 'cdnjs.cloudflare.com',
            alias: 'test',
          },
          body: (JSON.stringify({
            url,
            currentOffer,
          })),
        };

        const config = Config({ stageVariables: validEvent.stageVariables });

        const testRip = {
          url,
          uuid: 'a2ba5696-a37a-4d19-a266-96fd54517244', // has to map to a real user
          domain,
          originalUrl: `${url}&volumedata=123123`,
        };
        const geo = {
          country: 'US',
        };

        const addTestRip = () => new Promise((resolve, reject) => {
          const db = new Dao({
            config,
          });
          const mongoDao = db.getMongoDao();

          mongoDao.createRip(testRip, geo)
            .then(() => db.closeConnection())
            .then(() => resolve())
            .catch(err => reject(err));
        });

        const removeTestRip = () => new Promise((resolve, reject) => {
          const db = new Dao({
            config,
          });
          const mongoDao = db.getMongoDao();

          mongoDao.removeRip(testRip.url)
            .then(() => db.closeConnection())
            .then(() => resolve())
            .catch(err => reject(err));
        });

        // Test Prep:
        // 1. Remove the current domain if it is already whitelisted from:
        //   a. mongodb
        //   b. redis
        beforeEach((done) => {
          addTestRip()
            .then(() => done())
            .catch(err => done(err));
        });

        // Test Cleanup:
        // 1. Remove the current domain if it is already whitelisted from:
        //   a. mongodb
        //   b. redis
        afterEach((done) => {
          removeTestRip()
            .then(() => done())
            .catch(err => done(err));
        });

        it('Add currentOffer attribute to a rip', (done) => {
          const db = new Dao({ config });
          const mongoDao = db.getMongoDao();

          Runner.run({
            db,
            event: validEvent,
            context: {},
            callback: () => {
              setTimeout(() => {
                try {
                  // Expect that our rip is now rocking the currentOffer
                  mongoDao.getRip(testRip.url)
                    .then((rip) => {
                      assert.isString(rip.currentOffer);
                      expect(rip.currentOffer).to.equal(currentOffer);
                      done();
                    })
                    .catch((err) => {
                      done(err);
                    });
                } catch (err) {
                  done(err);
                }
              }, 500);
            },
          });
        });
      });
    });
  });
});
