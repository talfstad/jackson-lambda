import _ from 'lodash';
import logger from 'npmlog';
import moment from 'moment';
import { logLevel } from '../../../../config';

logger.level = logLevel;

class OptimisticUpdater {
  constructor({ geo, userConfig }) {
    if (!geo) throw new Error('OptimisticUpdater must include inputs with key geo to init');
    if (!userConfig) throw new Error('OptimisticUpdater must include inputs with key userConfig to init');

    this.cc = geo.country;

    this.updateHitsPerMinAndConsecutiveMinTraffic =
      ({ hits_per_min, consecutive_min_traffic, last_updated }) => {
        // is now and then on different minutes, or is last_updated more than a minute ago? reset.
        // else increment.

        const then = moment(last_updated);
        const now = moment();
        const thenMinutes = parseInt(then.format('m'), 10);
        const nowMinutes = parseInt(now.format('m'), 10);
        const lastUpdatedMoreThanMinuteAgo = (now.subtract(60, 'seconds')).isAfter(then);

        if (thenMinutes !== nowMinutes || lastUpdatedMoreThanMinuteAgo) {
          logger.silly('OptimisticUpdater updateHitsPerMin: updated more than a minute ago, resetting to 1');
          return {
            hits_per_min: 1,
            consecutive_min_traffic:
              (userConfig.min_hits_per_min_to_take <= hits_per_min) ?
                consecutive_min_traffic + 1
              :
                0,
          };
        }

        return {
          hits_per_min: hits_per_min + 1,
        };
      };

    this.updateJacksForRip = (ripRecord) => {
      const now = moment();
      const nowHour = parseInt(now.format('H'), 10);

      const hourlyKeyedByHour = _.keyBy(ripRecord.archive.hourly, 'hour');
      const hourToChange = hourlyKeyedByHour[nowHour];

      if (!hourToChange) return ripRecord;

      const hourToChangeHitsKeyedByCC = _.keyBy(hourToChange.hits, 'cc');
      const ccToAddJackTo = hourToChangeHitsKeyedByCC[this.cc];

      if (!ccToAddJackTo) return ripRecord;

      return {
        ...ripRecord,
        daily_jacks: this.getDailyJacks(ripRecord.archive.hourly),
        archive: {
          ...ripRecord.archive,
          hourly: _.map({
            ...hourlyKeyedByHour,
            [nowHour]: {
              ...hourToChange,
              hits: _.map({
                ...hourToChangeHitsKeyedByCC,
                [this.cc]: {
                  ...ccToAddJackTo,
                  jacks: (ccToAddJackTo.jacks || 0) + 1,
                },
              }, val => val),
            },
          }, val => val),
        },
      };
    };

    this.updateTotalHits = ({ total_hits = 0 }) => total_hits + 1;

    this.updateArchive = ({ archive, last_updated }) => {
      // update daily and hourly archive. internal functions to do each in here.
      const { hourly, daily } = archive;

      const updateHourly = () => {
        // working response object ensures keys are available before we
        // attempt a mutation on them.
        let responseUpatedHourly = hourly;

        const then = moment(last_updated);
        const now = moment();
        const thenHour = parseInt(then.format('H'), 10);
        const nowHour = parseInt(now.format('H'), 10);
        const lastUpdatedMoreThanHourAgo = (now.subtract(1, 'hours')).isAfter(then);

        // We are going to search for hour
        let hourlyKeyByHour = _.keyBy(responseUpatedHourly, 'hour');

        // 1. if we have no hour in collection, add it and return set hits to 1 for correct cc
        if (!hourlyKeyByHour[nowHour]) {
          logger.silly('OptimisticUpdater updateHourly: hour not found, adding to collection');
          responseUpatedHourly = responseUpatedHourly.concat([{
            hour: nowHour,
            hits: [{
              cc: this.cc,
              hits: 0,
            }],
          }]);

          // Re-key it becuase we added an hour.
          hourlyKeyByHour = _.keyBy(responseUpatedHourly, 'hour');
        }

        // We are going to search hits for our our by cc
        const hourHitsKeyByCC = _.keyBy(hourlyKeyByHour[nowHour].hits, 'cc');

        // 2. if we have no cc in hour hits, add it and return set hits to 1
        if (!hourHitsKeyByCC[this.cc]) {
          responseUpatedHourly = responseUpatedHourly.map((hour) => {
            if (hour.hour === nowHour) {
              // add this new cc to hits
              return {
                ...hour,
                hits: hour.hits.concat([
                  {
                    cc: this.cc,
                    hits: 0,
                  },
                ]),
              };
            }
            return hour;
          });
        }

        // 3. if not this hour, reset hits to 1 for this cc, remove other hits from hour.
        if (thenHour !== nowHour || lastUpdatedMoreThanHourAgo) {
          logger.silly(`OptimisticUpdater updateArchive.updateHourly: updated more than hour ago, resetting this hour ${nowHour} and applying hit to CC`);

          return responseUpatedHourly.map((hour) => {
            if (hour.hour !== nowHour) {
              return hour;
            }

            // reset hits for this hour. Keep only the one with this cc and 1 hit.
            return {
              ...hour,
              hits: hour.hits.filter(hit => hit.cc === this.cc).map(hit => ({ ...hit, hits: 1 })),
            };
          });
        }

        // 4. if we have hour and cc return incremented hits
        return responseUpatedHourly.map((hour) => {
          if (hour.hour !== nowHour) {
            return hour;
          }

          return {
            ...hour,
            hits: hour.hits.map((hit) => {
              if (hit.cc !== this.cc) {
                return hit;
              }
              // found correct hour, increment geo's hits
              return {
                ...hit,
                hits: hit.hits + 1,
              };
            }),
          };
        });
      };

      const updateDaily = () => {
        const then = moment(last_updated);
        const now = moment();
        const thenDay = parseInt(then.format('D'), 10);
        const nowDay = parseInt(now.format('D'), 10);
        const lastUpdatedMoreThanDayAgo = (now.subtract(1, 'days')).isAfter(then);

        if (thenDay !== nowDay || lastUpdatedMoreThanDayAgo) {
          return daily.concat([{
            hourly,
            // example format: 06/19/2017
            date: then.format('L'),
          }]);
        }

        return daily;
      };

      return {
        hourly: updateHourly(),
        daily: updateDaily(),
      };
    };

    this.getDailyHits = hourly =>
      _.reduce(hourly, (totalSum, hourOfHits) =>
        totalSum + _.reduce(hourOfHits.hits, (hourlySum, hit) => hourlySum + hit.hits, 0), 0);

    this.getDailyJacks = hourly =>
      _.reduce(hourly, (totalSum, hourOfHits) =>
        totalSum +
        _.reduce(hourOfHits.hits, (hourlySum, hit) =>
          hourlySum + (hit.jacks || 0), 0), 0);
  }

  incrementJacks(ripRecord) {
    return this.updateJacksForRip(ripRecord);
  }

  updateRip(ripRecord) {
    if (!ripRecord) {
      throw new Error('No ripRecord given to update rip');
    }

    const response = {
      ...(_.isUndefined(ripRecord.toObject) ? ripRecord : ripRecord.toObject()),
      last_updated: new Date(),
      ...(this.updateHitsPerMinAndConsecutiveMinTraffic(ripRecord)),
      total_hits: this.updateTotalHits(ripRecord),
      archive: this.updateArchive(ripRecord),
    };

    return {
      ...response,
      daily_hits: this.getDailyHits(response.archive.hourly),
    };
  }
}

export default OptimisticUpdater;
