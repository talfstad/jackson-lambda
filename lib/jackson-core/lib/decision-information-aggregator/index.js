import _ from 'lodash';
import logger from 'npmlog';
import { logLevel } from '../../../../config';
import Dao from '../dao';

logger.level = logLevel;

class DecisionInformationAggregator {
  constructor({ config }) {
    this.db = new Dao({ config });

    this.createIfNewRip = ({ url, ripRecord }) => new Promise((resolve, reject) => {
      if (_.isNull(ripRecord)) {
        // save to mongo and reject either way so we forward request
        // we will never want to rip the first hit we get.
        logger.silly('DecisionInformationAggregator: trying to create new rip');
        this.db.createRip(url)
        .then(() => reject())
        .catch(() => reject());
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
        .then(() => this.createIfNewRip({ url, ripRecord }))
        .then(() => this.db.getUserConfig(uuid))
        .then(() => this.db.closeConnection())
        .then(userConfig => resolve({ inputs, userConfig, ripRecord }))
        .catch((err) => {
          this.db.closeConnection()
            .then(() => reject(err))
            .catch(e => reject(e));
        });
    });
  }
}

export default DecisionInformationAggregator;
