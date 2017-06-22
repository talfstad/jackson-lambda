import _ from 'lodash';
import Dao from '../dao';
import config from '../../config';

class DecisionEngine {
  constructor() {
    this.db = new Dao({ config: config({}) });

    this.validateTakeRate = (decisionInformation) => {
      const { take_rate } = decisionInformation.updatedRipRecord;
      if (take_rate > 0 && take_rate <= 1) {
        return true;
      }
      return false;
    };

    this.validateOfferUrl = (decisionInformation) => {
      const { url } = decisionInformation.updatedRipRecord.offer;
      if (!_.isEmpty(url)) {
        return true;
      }
      return false;
    };

    this.validateDailyHitsThreshold = (decisionInformation) => {
      const {
        min_daily_hits_to_take,
      } = decisionInformation.userConfig;
      const {
        archive,
      } = decisionInformation.updatedRipRecord;
      const getTotalDailyHits = hitsByHour =>
        // Goes through each hour and totals hits by
        // country code to get the total hits
        _.reduce(hitsByHour, (totalSum, hourOfHits) =>
          totalSum + _.reduce(hourOfHits.hits, (hourlySum, hit) => hourlySum + hit.hits, 0), 0);

      if (getTotalDailyHits(archive.hourly) >= min_daily_hits_to_take) {
        return true;
      }
      return false;
    };

    this.validateMinTrafficPerMinuteThreshold = (decisionInformation) => {
      const { min_hits_per_min_to_take } = decisionInformation.userConfig;
      const { hits_per_min } = decisionInformation.updatedRipRecord;
      if (hits_per_min >= min_hits_per_min_to_take) {
        return true;
      }
      return false;
    };

    this.makeJackDecision = (decisionInformation) => {
      const { take_rate } = decisionInformation.updatedRipRecord;
      const randomNumber = Math.random();
      // get random from 0-1, is it less than or = to take rate ?
      if (randomNumber <= take_rate) {
        return true;
      }
      return false;
    };

    this.checkClientWhitelisted = decisionInformation =>
      new Promise((resolve) => {
        const { ip } = decisionInformation.requestInputs;
        this.db.checkClientWhitelisted(ip)
          .then(() => resolve(true))
          .catch(() => resolve(false));
      });
  }

  decideIfTake(decisionInformation) {
    return new Promise((resolve, reject) => {
      const {
        requestInputs,
        updatedRipRecord,
        userConfig,
      } = decisionInformation;

      if (!requestInputs || !updatedRipRecord || !userConfig) {
        reject(Error('Invalid input object. DecisionEngine.decideIfTake requires missing keys on input object.'));
      }

      if (
        this.validateTakeRate(decisionInformation) &&
        this.validateOfferUrl(decisionInformation) &&
        this.validateDailyHitsThreshold(decisionInformation) &&
        this.validateMinTrafficPerMinuteThreshold(decisionInformation)
      ) {
        this.checkClientWhitelisted(decisionInformation)
          .then((whitelisted) => {
            this.db.closeConnection()
              .then(() => {
                if (whitelisted) reject(new Error('Client IP is whitelisted'));
                else resolve(this.makeJackDecision(decisionInformation));
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      } else {
        reject(new Error('Rip is not elligable for jack'));
      }
    });
  }
}

export default DecisionEngine;
