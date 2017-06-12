import RequestQualifier from './lib/request-qualifier';

class JacksonCore {
  static processRequest(inputs) {
    return new Promise((resolve, reject) => {
      new RequestQualifier().validate(inputs)
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
