import _ from 'lodash';
import logger from 'npmlog';
import { logLevel } from '../../../../config';
import OptimisticUpdater from '../optimistic-updater';

logger.level = logLevel;

class DecisionInformationAggregator {
  constructor({ db }) {
    this.db = db;

    this.createIfNewRip = ({ inputs, ripRecord }) => new Promise((resolve, reject) => {
      if (_.isNull(ripRecord)) {
        // save to mongo and reject either way so we forward request
        // we will never want to rip the first hit we get.

        logger.silly('DecisionInformationAggregator: trying to create new rip');
        this.db.createRip({
          uuid: inputs.uuid,
          url: inputs.url,
        }, inputs.geo)
        .then(() => reject(new Error('Brand new Rip')))
        .catch(() => reject(new Error('Brand new Rip')));
      } else {
        resolve(ripRecord);
      }
    });
  }

  aggregate(inputs) {
    const { url, uuid } = inputs;

    return new Promise((resolve, reject) => {
      let ripRecord = null;

      this.db.getRip(url)
        .then((responseRecord) => {
          ripRecord = responseRecord;
        })
        .then(() => this.createIfNewRip({ inputs, ripRecord }))
        .then(() => this.db.getUserConfig(uuid))
        .then((userConfig) => {
          try {
            resolve({
              requestInputs: inputs,
              userConfig,
              updatedRipRecord: new OptimisticUpdater({ userConfig, inputs }).updateRip(ripRecord),
            });
          } catch (err) {
            logger.error(err);
          }
        })
        .catch(err => reject(err));
    });
  }
}

export default DecisionInformationAggregator;
