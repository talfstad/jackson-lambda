import _ from 'lodash';
import RequestFinalization from '../../../../../../../lib/jackson-core/lib/request-finalization';
import Config from '../../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('RequestFinalization', () => {
      describe('finalizeRequest', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });

          const decisionInformation = {
            userConfig: {
              last_updated: new Date(),
              min_minutes_consecutive_traffic: 3,
              min_daily_hits_to_take: 4,
              min_hits_per_min_to_take: 10,
            },
            requestInputs: {
              host: 'testhost.com',
              uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
              ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
              url: 'https://some-lander.com/landingpage.html',
              geo: { country: 'US' },
            },
            updatedRipRecord: {

            },
          };

          const jackDecision = false;

          const validInputs = {
            decisionInformation,
            jackDecision,
          };

          it('Fail if not given inputs object with jackDecision key', (done) => {
            const db = new Dao({ config });
            new RequestFinalization({ db }).finalizeRequest(_.omit(validInputs, 'jackDecision'))
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if not given inputs object with decisionInformation key', (done) => {
            const db = new Dao({ config });
            new RequestFinalization({ db }).finalizeRequest(_.omit(validInputs, 'decisionInformation'))
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });
        });
      });
    });
  });
});
