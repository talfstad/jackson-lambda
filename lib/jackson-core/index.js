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

    return new Promise((resolve, reject) => {
      new RequestQualifier({
        db: this.db,
      }).validate(inputs)
        .then(() => new DecisionInformationAggregator({
          db: this.db,
        }).aggregate(inputs))
        .then((decisionInformation) => {
          this.decisionInformation = decisionInformation;
        })
        .then(() => new DecisionEngine({ db: this.db }).decideIfTake(this.decisionInformation))
        .then((jackDecision) => {
          if (jackDecision) {
            resolve(null, this.decisionInformation);
          } else {
            resolve(new Error('Jackson Lambda: Not Jacking, forwarding response'));
          }
        })
        .then(() => new RequestFinalization().finalizeRequest())
        .then(() => this.db.closeConnection())
        .catch((err) => {
          this.db.closeConnection()
            .then(() => reject(err))
            .catch(e => reject(e));
        });
    });
  }
}

export default JacksonCore;
