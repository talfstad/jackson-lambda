import _ from 'lodash';
import logger from 'npmlog';
import { logLevel } from '../../../../config';
import OptimisticUpdater from '../optimistic-updater';

logger.level = logLevel;

class DecisionInformationAggregator {
  constructor({ db }) {
    if (!db) throw new Error('DecisionInformationAggregator requires a DAO instance on construction');
    this.db = db;

    this.createIfNewRip = ({ inputs, ripRecord }) => new Promise((resolve, reject) => {
      if (_.isNull(ripRecord)) {
        // save to mongo and reject either way so we forward request
        // we will never want to rip the first hit we get.
        logger.silly('DecisionInformationAggregator: trying to create new rip');
        this.db.createRip({
          uuid: inputs.uuid,
          url: inputs.url,
          host: inputs.host,
        }, inputs.geo)
        .then(() => reject(new Error('Brand new Rip')))
        .catch((err) => {
          reject(err);
        });
      } else {
        resolve(ripRecord);
      }
    });
  }

  aggregate(inputs) {
    const { url, uuid, geo } = inputs;
    return new Promise((resolve, reject) => {
      let ripRecord = null;

      this.db.getRipAndWatch(url)
        .then((responseRecord) => {
          ripRecord = responseRecord;
        })
        .then(() => this.db.getUserConfig(uuid))
        .then((userConfig) => {
          try {
            resolve({
              requestInputs: inputs,
              userConfig,
              updatedRipRecord: new OptimisticUpdater({ userConfig, geo }).updateRip(ripRecord),
            });
          } catch (err) {
            reject(err);
          }
        })
        .catch((err) => {
          logger.silly(`FAILED TO GET RIP AND WATCH: ${err}`);
          this.createIfNewRip({ inputs, ripRecord })
            .then(() => {
              reject(err);
            })
            .catch((e) => {
              reject(e);
            });
        });
    });
  }
}

export default DecisionInformationAggregator;
