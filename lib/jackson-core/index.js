import Dao from './lib/dao';
import RequestQualifier from './lib/request-qualifier';
// import DecisionInformationAggregator from './lib/decision-information-aggregator';
import config from './config';

class JacksonCore {
  constructor({ stageVariables }) {
    this.config = config({ stageVariables });
    this.db = new Dao({ config: this.config });
  }

  processRequest(inputs) {
    this.inputs = inputs;
    return new Promise((resolve, reject) => {
      new RequestQualifier({ db: this.db }).validate(inputs)
        // .then(() => new DecisionInformationAggregator({ db: this.db }).aggregate(inputs))
        .then(() => {
          resolve(false, {});
          this.db.closeConnection();
        })
        .catch((err) => {
          reject(err);
          this.db.closeConnection();
        });
    });
  }
}

export default JacksonCore;
