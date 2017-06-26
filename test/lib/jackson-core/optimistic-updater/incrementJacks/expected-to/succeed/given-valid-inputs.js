import _ from 'lodash';
import moment from 'moment';
import { expect } from 'chai';
import OptimisticUpdater from '../../../../../../../lib/jackson-core/lib/optimistic-updater';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('OptimisticUpdater', () => {
      describe('incrementJacks', () => {
        describe('Expected to', () => {
          const validInputs = {
            uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
            ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
            url: 'https://some-lander.com/landingpage.html',
            geo: { country: 'US' },
          };

          // Example rip record:
          const cc = 'US';
          const exampleRipRecord = {
            archive: {
              hourly: [
                {
                  hour: 0,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 10,
                    },
                  ],
                },
                {
                  hour: 1,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 10,
                    },
                  ],
                },
                {
                  hour: 2,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 10,
                    },
                  ],
                },
                {
                  hour: 3,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 4,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 5,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 6,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 7,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 8,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 9,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 10,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 11,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 12,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 4,
                    },
                  ],
                },
                {
                  hour: 13,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 14,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 10,
                    },
                  ],
                },
                {
                  hour: 15,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 16,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 17,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 18,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 19,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 20,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 21,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 22,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 0,
                    },
                  ],
                },
                {
                  hour: 23,
                  hits: [
                    {
                      cc,
                      hits: 200,
                      jacks: 10,
                    },
                  ],
                },
              ],
            },
          };

          it('Increment jacks by 1 for US for now() hour', (done) => {
            try {
              const now = moment();
              const nowHour = parseInt(now.format('H'), 10);

              const hourlyKeyedByHour = _.keyBy(exampleRipRecord.archive.hourly, 'hour');
              const hourToChange = hourlyKeyedByHour[nowHour];
              const hourToChangeHitsKeyedByCC = _.keyBy(hourToChange.hits, 'cc');
              const ccToAddJackTo = hourToChangeHitsKeyedByCC[cc];

              const oldJacks = ccToAddJackTo.jacks;

              const updater = new OptimisticUpdater(validInputs);
              const updatedRecord = updater.incrementJacks(exampleRipRecord);

              const updatedHourlyKeyedByHour = _.keyBy(updatedRecord.archive.hourly, 'hour');
              const updatedHourToChange = updatedHourlyKeyedByHour[nowHour];
              const updatedHourToChangeHitsKeyedByCC = _.keyBy(updatedHourToChange.hits, 'cc');
              const updatedCCToAddJackTo = updatedHourToChangeHitsKeyedByCC[cc];

              const newJacks = updatedCCToAddJackTo.jacks;

              expect(newJacks).to.equal(oldJacks + 1);
              done();
            } catch (err) {
              done(err);
            }
          });
        });
      });
    });
  });
});
