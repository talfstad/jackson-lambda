import logger from 'npmlog';
import RequestQualifier from './lib/request-qualifier';
import DecisionInformationAggregator from './lib/decision-information-aggregator';
import DecisionEngine from './lib/decision-engine';
import RequestFinalization from './lib/request-finalization';
import config from './config';
import {
  logLevel,
} from '../../config';

logger.level = logLevel;

class JacksonCore {
  constructor({ stageVariables }) {
    this.config = config({
      stageVariables,
    });
  }

  processRequest(inputs) {
    this.inputs = inputs;
    this.decisionInformation = null;

    return new Promise((resolve, reject) => {
      new RequestQualifier({
        config: this.config,
      }).validate(inputs)
        .then(() => new DecisionInformationAggregator({
          config: this.config,
        }).aggregate(inputs))
        .then((decisionInformation) => {
          this.decisionInformation = decisionInformation;
        })
        .then(() => new DecisionEngine().decideIfTake(this.decisionInformation))
        .then((jackDecision) => {
          if (jackDecision) {
            resolve(null, this.decisionInformation);
          } else {
            resolve(new Error('Jackson Lambda: Not Jacking, forwarding response'));
          }
        })
        .then(() => new RequestFinalization().finalizeRequest())
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default JacksonCore;
