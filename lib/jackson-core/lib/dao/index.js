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

  createRip(rip, geo) {
    return new Promise((resolve, reject) => {
      logger.silly('Dao: trying to create new rip');
      this.mongoDao.createRip(rip, geo)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  checkClientWhitelisted(ip) {
    return new Promise((resolve, reject) => {
      this.redisDao.checkClientWhitelisted(ip)
        .then(() => resolve())
        .catch(err => reject(err));
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
    return new Promise((resolve) => {
      try {
        this.redisDao.closeConnection()
          .then(() => this.mongoDao.closeConnection())
          .then(() => {
            resolve();
          })
          .catch(err => resolve(err));
      } catch (err) {
        // connection already closed.
        resolve();
      }
    });
  }
}

export default Dao;
