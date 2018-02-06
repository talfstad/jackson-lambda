import _ from 'lodash';
import {
    expect,
} from 'chai';

import Config from '../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../lib/jackson-core/lib/dao';

import Runner from '../../../../../../src/runner';

describe('Jackson Lambda', () => {
  describe('REST API', () => {
    describe('Whitelist Domain', () => {
      describe('a valid request will whitelist input domain', () => {
        const domain = 'www.testdomaintowhitelistthroughrestendpoint.com';
        const validEvent = {
          path: '/api/whitelist-domain',
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
            domain,
          })),
        };

        const config = Config({ stageVariables: validEvent.stageVariables });

        const removeWhitelistedDomain = () => new Promise((resolve, reject) => {
          const db = new Dao({
            config,
          });

          const redisDao = db.getRedisDao();
          const mongoDao = db.getMongoDao();

          mongoDao.removeWhitelistedDomain(domain)
          .then(() => redisDao.delWhitelistedDomains(domain))
          .then(() => db.closeConnection())
          .then(() => resolve())
          .catch(err => reject(err));
        });

        // Test Prep:
        // 1. Remove the current domain if it is already whitelisted from:
        //   a. mongodb
        //   b. redis
        beforeEach((done) => {
          removeWhitelistedDomain()
            .then(() => done())
            .catch(err => done(err));
        });

        // Test Cleanup:
        // 1. Remove the current domain if it is already whitelisted from:
        //   a. mongodb
        //   b. redis
        afterEach((done) => {
          removeWhitelistedDomain()
            .then(() => done())
            .catch(err => done(err));
        });

        it(`Whitelist domain ${domain}`, (done) => {
          const db = new Dao({ config });
          const mongoDao = db.getMongoDao();

          Runner.run({
            db,
            event: validEvent,
            context: {},
            callback: () => {
              setTimeout(() => {
                try {
                  mongoDao.getWhitelistedDomains()
                    .then((whitelistedDomains) => {
                      const foundDomains = _.filter(whitelistedDomains, whitelistedDomain =>
                        whitelistedDomain.name === domain);
                      // Expect to only find one domain whitelisted with this name.
                      expect(foundDomains).to.have.lengthOf(1);
                      done();
                    });
                } catch (e) {
                  done(e);
                }
              }, 500);
            },
          });
        });

        it(`Whitelist domain http://${domain}`, (done) => {
          const db = new Dao({ config });
          const mongoDao = db.getMongoDao();

          Runner.run({
            db,
            event: {
              ...validEvent,
              body: (JSON.stringify({
                domain: `http://${domain}`,
              })),
            },
            context: {},
            callback: () => {
              setTimeout(() => {
                try {
                  mongoDao.getWhitelistedDomains()
                    .then((whitelistedDomains) => {
                      const foundDomains = _.filter(whitelistedDomains, whitelistedDomain =>
                        whitelistedDomain.name === domain);

                      // Expect to only find one domain whitelisted with this name.
                      expect(foundDomains).to.have.lengthOf(1);
                      done();
                    });
                } catch (e) {
                  done(e);
                }
              }, 500);
            },
          });
        });
      });
    });
  });
});
