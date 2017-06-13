import RedisDao from './redis-dao';
import MongoDao from './mongo-dao';

class Dao {
  constructor({ config }) {
    this.redisDao = new RedisDao({ config: config.redisDaoConfig() });
    this.mongoDao = new MongoDao({ config: config.mongoDaoConfig() });
  }

  getUserConfig(uuid) {
    return new Promise((resolve, reject) => {
      this.redisDao.getUserConfig(uuid)
        .then((userConfig) => {
          resolve(userConfig);
        })
        .catch(() => {
          this.mongoDao.getUserConfig(uuid)
            .then((userConfig) => {
              resolve(userConfig);
              this.redisDao.setUserConfig(userConfig);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  getUrlRecord(url) {
    return new Promise((resolve, reject) => {
      this.redisDao.getUrlRecord(url)
        .then((urlRecord) => {
          resolve(urlRecord);
        })
        .catch(() => {
          this.mongoDao.getUrlRecord(url)
            .then((urlRecord) => {
              resolve(urlRecord);
              this.redisDao.setUrlRecord(urlRecord);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  getWhitelistedDomains() {
    return new Promise((resolve, reject) => {
      this.redisDao.getWhitelistedDomains()
        .then((whitelistedDomains) => {
          resolve(whitelistedDomains);
        })
        .catch(() => {
          this.mongoDao.getWhitelistedDomains()
            .then((domains) => {
              resolve(domains);
              this.redisDao.setWhitelistedDomains(domains);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  closeConnection() {
    try {
      this.redisDao.closeConnection();
      this.mongoDao.closeConnection();
    } catch (err) {
      // connection already closed.
    }
  }
}

export default Dao;
