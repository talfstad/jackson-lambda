import DecisionEngine from '../../../../../../../lib/jackson-core/lib/decision-engine';
import Config from '../../../../../../../lib/jackson-core/config';
import Dao from '../../../../../../../lib/jackson-core/lib/dao';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('DecisionEngine', () => {
      describe('decideIfJack', () => {
        describe('Expected to', () => {
          const config = Config({ stageVariables: {} });

          const ip = '2602:304:ce3e:27f0:1e:abc8:9568:8b1';
          const decisionInformation = {
            userConfig: {
              last_updated: new Date(),
              min_minutes_consecutive_traffic: 0,
              min_daily_hits_to_take: 0,
              min_hits_per_min_to_take: 0,
            },
            requestInputs: {
              uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
              ip,
              url: 'https://some-lander.com/landingpage.html',
              geo: { country: 'US' },
            },
            updatedRipRecord: {
              take_rate: 1,
              offer: {
                url: 'http://testurl.com',
              },
              daily_hits: 10,
              daily_jacks: 0,
              whitelisted: true,
              hits_per_min: 5,
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

          it('Fail if rip is whitelisted', (done) => {
            const db = new Dao({ config });
            new DecisionEngine({ db }).decideIfJack(decisionInformation)
              .then(({ jack }) => {
                if (jack) {
                  done(new Error('Failed to recognize incorrect inputs'));
                } else {
                  db.closeConnection()
                    .then(() => done());
                }
              })
              .catch((err) => {
                db.closeConnection()
                  .then(() => done(err));
              });
          });
        });
      });
    });
  });
});
