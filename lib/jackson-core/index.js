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
          // create a new object which is updated url Record before making a decision
          // do this in decision info aggregator since it makes sense there most. Then
          // when we get back here we will just call the decision engine. then return.
          // finalization will be called from lambda. but will be a part of core.
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
