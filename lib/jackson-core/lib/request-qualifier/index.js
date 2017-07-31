class RequestQualifier {
  constructor({ db }) {
    if (!db) throw new Error('RequestQualifier requires a DAO instance on construction');
    this.db = db;

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

    this.checkClientWhitelisted = ip =>
      new Promise((resolve, reject) => {
        this.db.checkClientWhitelisted(ip)
          .then(() => reject(new Error(`Client IP is whitelisted ${ip}`)))
          .catch(() => resolve());
      });
  }

  validate({ ip, url, uuid }) {
    return new Promise((resolve, reject) => {
      if (!this.validIP(ip) ||
          !this.validURL(url) ||
          !this.validUUID(uuid)) {
        throw new Error('Inputs are invalid');
      }
      this.checkClientWhitelisted(ip)
        .then(() => {
          resolve();
        }).catch((e) => {
          reject(e);
        });
    });
  }
}

export default RequestQualifier;
