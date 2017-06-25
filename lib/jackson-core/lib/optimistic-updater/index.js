import _ from 'lodash';
import logger from 'npmlog';
import moment from 'moment';
import { logLevel } from '../../../../config';

logger.level = logLevel;

class OptimisticUpdater {
  constructor({ userConfig, inputs = {} }) {
    if (!userConfig) throw new Error('OptimisticUpdater must include userConfig to init');
    if (!inputs.geo) throw new Error('OptimisticUpdater must include inputs with key geo to init');

    this.userConfig = userConfig;
    this.cc = inputs.geo.country;

    this.updateHitsPerMin = ({ hits_per_min, last_updated }) => {
      // is now and then on different minutes, or is last_updated more than a minute ago? reset.
      // else increment.

      const then = moment(last_updated);
      const now = moment();
      const thenMinutes = parseInt(then.format('m'), 10);
      const nowMinutes = parseInt(now.format('m'), 10);
      const lastUpdatedMoreThanMinuteAgo = (now.subtract(60, 'seconds')).isAfter(then);

      if (thenMinutes !== nowMinutes || lastUpdatedMoreThanMinuteAgo) {
        logger.silly('OptimisticUpdater updateHitsPerMin: updated more than a minute ago, resetting to 1');
        return 1;
      }

      return hits_per_min + 1;
    };

    this.updateTotalHits = ({ total_hits }) => total_hits + 1;

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
        const hoursKeyByHour = _.keyBy(responseUpatedHourly, 'hour');

        // 1. if we have no hour in collection, add it and return set hits to 1 for correct cc
        if (!hoursKeyByHour[nowHour]) {
          logger.silly('OptimisticUpdater updateHourly: hour not found, adding to collection');
          responseUpatedHourly = responseUpatedHourly.concat([{
            hour: nowHour,
            hits: [{
              cc: this.cc,
              hits: 0,
            }],
          }]);
        }

        // We are going to search hits for our our by cc
        const hourHitsKeyByCC = _.keyBy(hoursKeyByHour[nowHour].hits, 'cc');

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
  }

  updateRip(ripRecord) {
    if (!ripRecord) {
      throw new Error('No ripRecord given to update rip');
    } else {
      return {
        ...(ripRecord.toObject ? ripRecord.toObject() : ripRecord),
        last_updated: new Date(),
        hits_per_min: this.updateHitsPerMin(ripRecord),
        total_hits: this.updateTotalHits(ripRecord),
        archive: this.updateArchive(ripRecord),
      };
    }
  }
}

export default OptimisticUpdater;