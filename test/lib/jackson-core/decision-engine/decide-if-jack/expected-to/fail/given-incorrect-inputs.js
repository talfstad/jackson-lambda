import _ from 'lodash';
import DecisionEngine from '../../../../../../../lib/jackson-core/lib/decision-engine';
import Config from '../../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('DecisionEngine', () => {
      describe('decideIfJack', () => {
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

          it('Fail if not given inputs object with userConfig key', (done) => {
            const db = new Dao({ config });
            new DecisionEngine({ db }).decideIfJack(_.omit(decisionInformation, 'userConfig'))
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if not given inputs object with requestInputs key', (done) => {
            const db = new Dao({ config });
            new DecisionEngine({ db }).decideIfJack(_.omit(decisionInformation, 'requestInputs'))
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if not given inputs object with updatedRipRecord key', (done) => {
            const db = new Dao({ config });
            new DecisionEngine({ db }).decideIfJack(_.omit(decisionInformation, 'updatedRipRecord'))
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
