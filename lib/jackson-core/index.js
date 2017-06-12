import Dao from './lib/dao';
import RequestQualifier from './lib/request-qualifier';
import config from './config';

class JacksonCore {
  constructor({ stageVariables }) {
    this.config = config({ stageVariables });
    this.db = new Dao({ config: this.config });
  }

  processRequest(inputs) {
    return new Promise((resolve, reject) => {
      new RequestQualifier({ db: this.db }).validate(inputs)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default JacksonCore;
