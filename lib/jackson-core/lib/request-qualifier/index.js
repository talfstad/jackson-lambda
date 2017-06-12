import Dao from '../dao';

class RequestQualifier {
  constructor() {
    this.validIP = (ip) => {
      if (ip) {
        return true;
      }
      return false;
    };

    this.validURL = (url) => {
      if (url) {
        return true;
      }
      return false;
    };

    this.validUUID = (uuid) => {
      if (uuid) {
        return true;
      }
      return false;
    };

    // validate IP is not whitelisted.
    this.validateIP = ip => new Promise((resolve, reject) => {
      new Dao().getWhitelistedDomains()
        .then((whitelistedDomains) => {
          // TODO: test is more complicated
          // need to test the base domain against input url using /
          if (whitelistedDomains.indexOf(ip) < 0) {
            resolve();
          }
          throw new Error('Domain is whitelisted');
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  validate({ ip, url, uuid }) {
    return new Promise((resolve, reject) => {
      if (!this.validIP(ip) ||
          !this.validURL(url) ||
          !this.validUUID(uuid)) {
        throw new Error('Inputs are invalid');
      }

      this.validateIP().then(() => {
        resolve();
      }).catch((e) => {
        reject(e);
      });
    });
  }
}

export default RequestQualifier;
