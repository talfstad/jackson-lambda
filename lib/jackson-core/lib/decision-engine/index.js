import _ from 'lodash';
import Config from '../../config';

class DecisionEngine {
  constructor({ db }) {
    if (!db) throw new Error('DecisionEngine requires a DAO instance on construction');
    this.db = db;

    this.noJackDecisionResponse = { jack: false, ghostClick: false };

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
        daily_hits,
      } = decisionInformation.updatedRipRecord;

      if (daily_hits >= min_daily_hits_to_take) {
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

    this.makeGhostClickDecision = () => {
      const {
        ghostClickPercentage,
      } = Config({});
      const randomNumber = Math.random();

      if (randomNumber <= ghostClickPercentage) {
        return true;
      }

      return false;
    };

    this.makeJackDecision = (decisionInformation) => {
      const { take_rate } = decisionInformation.updatedRipRecord;
      const randomNumber = Math.random();

      // get random from 0-1, is it less than or = to take rate ?
      if (randomNumber <= take_rate) {
        return {
          jack: true,
          ghostClick: this.makeGhostClickDecision(),
        };
      }
      return this.noJackDecisionResponse;
    };

    this.urlNotWhitelisted = (decisionInformation) => {
      // not whitelisted return true
      const { whitelisted = false } = decisionInformation.updatedRipRecord;
      return !whitelisted;
    };
  }

  decideIfJack(decisionInformation) {
    return new Promise((resolve, reject) => {
      const {
        requestInputs,
        updatedRipRecord,
        userConfig,
      } = decisionInformation;

      if (!requestInputs || !updatedRipRecord || !userConfig) {
        reject(Error('Invalid input object. DecisionEngine.decideIfJack requires missing keys on input object.'));
      }

      if (
        this.urlNotWhitelisted(decisionInformation) &&
        this.validateTakeRate(decisionInformation) &&
        this.validateOfferUrl(decisionInformation) &&
        this.validateDailyHitsThreshold(decisionInformation) &&
        this.validateMinTrafficPerMinuteThreshold(decisionInformation)
      ) {
        resolve(this.makeJackDecision(decisionInformation));
      } else {
        resolve(this.noJackDecisionResponse);
      }
    });
  }
}

export default DecisionEngine;
