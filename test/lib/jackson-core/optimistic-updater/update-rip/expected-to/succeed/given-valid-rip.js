import _ from 'lodash';
import moment from 'moment';
import { expect } from 'chai';
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
          };

          // Example rip record:
          const exampleRipRecord = {
            created_on: new Date(),
            last_updated: new Date(),
            url: 'http://somedomain.com/somelandingpage.html',
            take_rate: 0.1,
            total_hits: 200,
            hits_per_min: 15,
            archive: {
              daily: [
                {
                  date: moment().format('L'),
                  hourly: [
                    {
                      hour: 0,
                      hits: [
                        {
                          cc: 'US',
                          hits: 200,
                        },
                      ],
                    },
                  ],
                },
              ],
              hourly: [
                {
                  hour: 0,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 1,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 2,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 3,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 4,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 5,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 6,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 7,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 8,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 9,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 10,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 11,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 12,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 13,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 14,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 15,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 16,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 17,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 18,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 19,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 20,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 21,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 22,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
                {
                  hour: 23,
                  hits: [
                    {
                      cc: 'US',
                      hits: 200,
                    },
                  ],
                },
              ],
            },
            offer: {
              _id: 'X83f83f8-3f293jf-Jkldjf3ifj_ksdlfjlk',
              url: 'https://offer123.org?id=30xj&fj=39',
            },
          };

          it('Increment total hits by 1', (done) => {
            try {
              const updater = new OptimisticUpdater(validInputs);
              const updatedRip = updater.updateRip(exampleRipRecord);
              expect(updatedRip.total_hits).to.equal(exampleRipRecord.total_hits + 1);
              done();
            } catch (err) {
              done(err);
            }
          });

          it('Resets hits_per_min after after a minute or more has gone by', (done) => {
            try {
              const updater = new OptimisticUpdater(validInputs);
              const updatedRip = updater.updateRip({ ...exampleRipRecord, last_updated: moment().subtract(2, 'minutes') });
              expect(updatedRip.hits_per_min).to.equal(1);
              done();
            } catch (err) {
              done(err);
            }
          });

          it('Resets archive.hourly\'s hits & jacks when hour changes', (done) => {
            try {
              const updater = new OptimisticUpdater(validInputs);
              const now = moment();
              const nowHour = parseInt(now.format('H'), 10);
              const updatedRip = updater.updateRip({ ...exampleRipRecord, last_updated: moment().subtract(2, 'hours') });

              const updatedRipKeyedByHours = _.keyBy(updatedRip.archive.hourly, 'hour');
              const updatedRipSelectedHourKeyedByCC = _.keyBy(updatedRipKeyedByHours[nowHour].hits, 'cc');
              const updatedHits =
                updatedRipSelectedHourKeyedByCC[validInputs.geo.country].hits;

              expect(updatedHits).to.equal(1);
              done();
            } catch (err) {
              done(err);
            }
          });

          it('Increments hourly hits by 1 when on same hour', (done) => {
            try {
              const updater = new OptimisticUpdater(validInputs);
              const now = moment();
              const nowHour = parseInt(now.format('H'), 10);
              const updatedRip = updater.updateRip({ ...exampleRipRecord, last_updated: moment() });

              const exampleRipKeyedByHours = _.keyBy(exampleRipRecord.archive.hourly, 'hour');
              const exampleRipSelectedHourKeyedByCC = _.keyBy(exampleRipKeyedByHours[nowHour].hits, 'cc');
              const exampleHits =
                exampleRipSelectedHourKeyedByCC[validInputs.geo.country].hits;

              const updatedRipKeyedByHours = _.keyBy(updatedRip.archive.hourly, 'hour');
              const updatedRipSelectedHourKeyedByCC = _.keyBy(updatedRipKeyedByHours[nowHour].hits, 'cc');
              const updatedHits =
                updatedRipSelectedHourKeyedByCC[validInputs.geo.country].hits;

              expect(updatedHits).to.equal(exampleHits + 1);
              done();
            } catch (err) {
              done(err);
            }
          });

          it('Adds country code if doesn\'t exist and sets hits to 1', (done) => {
            try {
              const updater = new OptimisticUpdater({
                ...validInputs,
                geo: {
                  country: 'test-country-code',
                },
              });

              const now = moment();
              const nowHour = parseInt(now.format('H'), 10);
              const updatedRip = updater.updateRip({ ...exampleRipRecord, last_updated: moment() });

              const updatedRipKeyedByHours = _.keyBy(updatedRip.archive.hourly, 'hour');
              const updatedRipSelectedHourKeyedByCC = _.keyBy(updatedRipKeyedByHours[nowHour].hits, 'cc');
              const updatedHits =
                updatedRipSelectedHourKeyedByCC['test-country-code'].hits;
              expect(updatedHits).to.equal(1);
              done();
            } catch (err) {
              done(err);
            }
          });

          it('Saves daily hits when day has passed', (done) => {
            try {
              const updater = new OptimisticUpdater(validInputs);
              const last_updated = moment().subtract(2, 'days');
              const day = last_updated.format('L');
              const updatedRip = updater.updateRip({ ...exampleRipRecord, last_updated });
              const updatedRipArchiveDailyKeyByDate = _.keyBy(updatedRip.archive.daily, 'date');

              // We expect the exampleRipRecord hourly to equal the
              // updatedRip daily by date key hourly
              expect(updatedRipArchiveDailyKeyByDate[day].hourly)
                .to.deep.equal(exampleRipRecord.archive.hourly);

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
