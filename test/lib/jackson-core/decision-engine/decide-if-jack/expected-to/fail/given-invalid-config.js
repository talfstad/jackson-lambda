import _ from 'lodash';
import DecisionEngine from '../../../../../../../lib/jackson-core/lib/decision-engine';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('DecisionEngine', () => {
      describe('decideIfTake', () => {
        describe('Expected to', () => {
          // Will take 100% by default. no conditions are met
          const decisionInformation = {
            userConfig: {
              last_updated: new Date(),
              min_daily_hits_to_take: 4,
              min_minutes_consecutive_traffic: 3,
              min_hits_per_min_to_take: 10,
            },
            requestInputs: {
              uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
              ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
              url: 'https://some-lander.com/landingpage.html',
              geo: { country: 'US' },
            },
            updatedRipRecord: {
              take_rate: 0.3,
              offer: {
                _id: 'offer-id',
                url: 'http://testurl.com',
              },
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

          it('Fail if redirect rate 0', (done) => {
            new DecisionEngine().decideIfTake({
              ...decisionInformation,
              updatedRipRecord: {
                ...decisionInformation.updatedRipRecord,
                take_rate: 0,
              },
            })
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if threshold for consecutive traffic per min not met', (done) => {
            new DecisionEngine().decideIfTake({
              ...decisionInformation,
              updatedRipRecord: {
                ...decisionInformation.updatedRipRecord,
                consecutive_min_traffic: 2,
              },
            })
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if threshold for daily hits not met', (done) => {
            new DecisionEngine().decideIfTake({
              ...decisionInformation,
              userConfig: {
                ...decisionInformation.userConfig,
                min_daily_hits_to_take: 20,
              },
            })
              .then(() => {
                done(new Error('Failed to recognize incorrect inputs'));
              })
              .catch(() => done());
          });

          it('Fail if no valid offer URL', (done) => {
            new DecisionEngine().decideIfTake(_.omit(decisionInformation, 'updatedRipRecord.offer.url'))
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
