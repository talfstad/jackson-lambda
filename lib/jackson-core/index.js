import logger from 'npmlog';
import RequestQualifier from './lib/request-qualifier';
import DecisionInformationAggregator from './lib/decision-information-aggregator';
import config from './config';
import {
  logLevel,
} from '../../config';

logger.level = logLevel;

class JacksonCore {
  constructor({
    stageVariables,
  }) {
    this.config = config({
      stageVariables,
    });
  }

  processRequest(inputs) {
    this.inputs = inputs;
    return new Promise((resolve, reject) => {
      new RequestQualifier({
        config: this.config,
      }).validate(inputs)
        .then(() => new DecisionInformationAggregator({
          config: this.config,
        }).aggregate(inputs))
        .then((decisionInformation) => {
          logger.silly(`Decision Information: \n${JSON.stringify(decisionInformation)}`);
          resolve(false, {});
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default JacksonCore;
