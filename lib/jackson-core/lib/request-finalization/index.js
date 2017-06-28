import _ from 'lodash';
import OptimisticUpdater from '../optimistic-updater';

class RequestFinalization {
  constructor({ db }) {
    if (!db) throw new Error('RequestFinalization requires a DAO instance on construction');
    this.db = db;

    this.validateInputs = (inputs) => {
      const {
        jackDecision,
        decisionInformation,
      } = inputs;
      if (_.isUndefined(jackDecision) || _.isUndefined(decisionInformation)) {
        throw new Error('Invalid inputs to RequestFinalization finalizeRequest');
      }
    };
  }

  finalizeRequest(inputs) {
    return new Promise((resolve, reject) => {
      // validate finalize inputs
      this.validateInputs(inputs);

      const {
        decisionInformation,
        jackDecision,
      } = inputs;
      const {
        updatedRipRecord,
        requestInputs,
      } = decisionInformation;

      // updating rip in redis, and persisting to mongo if necessary
      this.db.updateRip({
        jackDecision,
        updatedRipRecord,
        optimisticUpdater: new OptimisticUpdater(requestInputs),
      })
      .then(() => this.db.whitelistClientIP(requestInputs.ip))
      .then(() => resolve())
      .catch(err => reject(err));
    });
  }
}

export default RequestFinalization;
