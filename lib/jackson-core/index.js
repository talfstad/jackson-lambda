import logger from 'npmlog';
import Dao from './lib/dao';
import RequestQualifier from './lib/request-qualifier';
import DecisionInformationAggregator from './lib/decision-information-aggregator';
import DecisionEngine from './lib/decision-engine';
import RequestFinalization from './lib/request-finalization';
import Config from './config';
import {
  logLevel,
} from '../../config';

logger.level = logLevel;

class JacksonCore {
  constructor({ stageVariables }) {
    this.config = Config({
      stageVariables,
    });
    this.db = new Dao({ config: this.config });
  }

  processRequest(inputs) {
    this.inputs = inputs;
    this.decisionInformation = null;
    this.decision = null;

    // Don't break the promise chain unless we don't need to do request
    // finalization, client IP whitelist & persist.
    // Chain intended to only be broken if:
    // - Invalid inputs
    // - URL whitelisted
    // - New Rip
    // Otherwise we intend to get to the request finalization
    // and capture updated data
    return new Promise((resolve, reject) => {
      // 1. Can break chain if URL whitelisted
      new RequestQualifier({
        db: this.db,
      }).validate(inputs)
        // 2. Can break chain if new rip
        .then(() => new DecisionInformationAggregator({
          db: this.db,
        }).aggregate(inputs))
        .then((decisionInformation) => {
          this.decisionInformation = decisionInformation;
        })
        .then(() => new DecisionEngine({ db: this.db }).decideIfJack(this.decisionInformation))
        .then((decision) => {
          this.decision = decision;
          // Resolve or reject to the caller here. Before requestFinalization.
          if (decision.jack) {
            resolve({
              decision,
              decisionInformation: this.decisionInformation,
            });
          } else {
            reject(new Error('Jackson Lambda: Not Jacking, forwarding response'));
          }
        })
        .then(() => new RequestFinalization({
          db: this.db,
        }).finalizeRequest({
          decisionInformation: this.decisionInformation,
          jackDecision: this.decision.jack,
        }))
        .then(() => this.db.closeConnection())
        .catch((err) => {
          logger.error(err);
          this.db.closeConnection()
            .then(() => reject(err))
            .catch(e => reject(e));
        });
    });
  }
}

export default JacksonCore;
