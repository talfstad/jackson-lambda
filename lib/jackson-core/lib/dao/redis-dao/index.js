import redis from 'redis';

class RedisDao {
  constructor(config) {
    this.connected = false;
    this.db = null;

    this.ensureConnection = () => new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        this.db = redis.createClient(config);

        this.db.on('ready', () => {
          this.connected = true;
          resolve();
        });

        this.db.on('error', (err) => {
          reject(err);
        });
      }
    });

    this.keyExists = key => new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.exists(key, (err, exists) => {
            if (!exists || err) reject(err);
            else resolve(exists);
          });
        })
        .catch(err => reject(err));
    });

    this.ensureWhitelistedDomainsKeyExists = () => new Promise((resolve, reject) => {
      this.keyExists('whitelistedDomains')
        .then(() => {
          resolve();
        })
        .catch(err => reject(err));
    });

    this.getWhitelistedDomainsFromRedis = () => new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.get('whitelistedDomains', (err, whitelistedDomains) => {
            if (err) reject(err);
            else resolve(whitelistedDomains);
          });
        });
    });
  }

  getWhitelistedDomains() {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(this.ensureWhitelistedDomainsKeyExists)
        .then(this.getWhitelistedDomainsFromRedis)
        .then((whitelistedDomains) => {
          resolve(JSON.parse(whitelistedDomains));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  setWhitelistedDomains(whitelistedDomains) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.set('whitelistedDomains', JSON.stringify(whitelistedDomains));
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  closeConnection() {
    this.db.quit();
    this.connected = false;
  }
}

export default RedisDao;
