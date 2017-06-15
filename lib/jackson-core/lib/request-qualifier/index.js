import Dao from '../dao';

class RequestQualifier {
  constructor({ config }) {
    this.db = new Dao({ config });

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

    this.urlNotWhitelisted = url => new Promise((resolve, reject) => {
      this.db.getWhitelistedDomains()
        .then((whitelistedDomains) => {
          this.db.closeConnection()
            .then(() => {
              const urlMatchesWhitelistedDomains =
              whitelistedDomains.filter(domain => url.includes(domain.name));

              if (urlMatchesWhitelistedDomains.length < 1) resolve();
              else throw new Error('Domain is whitelisted');
            })
            .catch(err => reject(err));
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

      this.urlNotWhitelisted(url).then(() => {
        resolve();
      }).catch((e) => {
        reject(e);
      });
    });
  }
}

export default RequestQualifier;
