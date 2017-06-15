import logger from 'npmlog';
import RedisDao from './redis-dao';
import MongoDao from './mongo-dao';
import { logLevel } from '../../../../config';

logger.level = logLevel;

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
          this.mongoDao.getUserFromUUID(uuid)
            .then((user) => {
              const userConfig = user.config;
              resolve(userConfig);
              this.redisDao.setUserConfig(user._id, userConfig);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  getRip(url) {
    return new Promise((resolve, reject) => {
      this.redisDao.getRip(url)
        .then((rip) => {
          resolve(rip);
        })
        .catch(() => {
          this.mongoDao.getRip(url)
            .then((rip) => {
              logger.silly(`Dao: We got the rip: ${rip}`);
              resolve(rip);
              this.redisDao.setRip(rip);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  createNewRip(url) {
    return new Promise((resolve, reject) => {
      logger.silly('Dao: trying to create new rip');
      this.mongoDao.createNewRip(url)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
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
