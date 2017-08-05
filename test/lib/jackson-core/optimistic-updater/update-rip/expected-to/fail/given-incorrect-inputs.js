import _ from 'lodash';
import { assert } from 'chai';
import OptimisticUpdater from '../../../../../../../lib/jackson-core/lib/optimistic-updater';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('OptimisticUpdater', () => {
      describe('updateRip', () => {
        describe('Expected to', () => {
          const validInputs = {
            uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
            ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
            url: 'https://some-lander.com/landingpage.html',
            geo: { country: 'US' },
            domain: 'testhost.com',
            originalUrl: 'http://testhost.com',
            userConfig: {
              last_updated: new Date(),
              min_minutes_consecutive_traffic: 0,
              min_daily_hits_to_take: 0,
              min_hits_per_min_to_take: 0,
            },
          };

          const ripRecord = {
          // This can be empty because we should never get far enough to process this.
          };

          it('Fail if not given inputs object with geo', (done) => {
            try {
              new OptimisticUpdater(_.omit(validInputs, 'geo')).updateRip(ripRecord);
              assert.fail(true, false, 'Incorrectly processed ripRecord that should have failed');
            } catch (err) {
              done();
            }
          });

          it('Fail if not given ripRecord key as argument', (done) => {
            try {
              new OptimisticUpdater(validInputs).updateRip();
              assert.fail(true, false, 'Incorrectly processed ripRecord that should have failed');
            } catch (err) {
              done();
            }
          });
        });
      });
    });
  });
});
