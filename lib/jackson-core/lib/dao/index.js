import logger from 'npmlog';
import RedisDao from './redis-dao';
import MongoDao from './mongo-dao';
import { logLevel } from '../../../../config';

logger.level = logLevel;

class Dao {
  constructor({ config }) {
    this.config = config;
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

  getRipAndWatch(url) {
    return new Promise((resolve, reject) => {
      let ripFromMongo = null;

      this.redisDao.getRipAndWatch(url)
        .then((rip) => {
          resolve(rip);
        })
        .catch(() => {
          this.mongoDao.getRip(url)
            .then((rip) => { ripFromMongo = rip; })
            .then(() => this.redisDao.setRipAndWatch(ripFromMongo))
            .then(() => resolve(ripFromMongo))
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

  updateRip({
    jackDecision,
    updatedRipRecord,
    optimisticUpdater,
  }) {
    return new Promise((resolve, reject) => {
      const updateRipInRedisWithRetry = (updatedRip) => {
        const { maxRetries } = this.config.redisDaoConfig();
        const promise = new Promise();

        const updateRipInRedis = (rip, retries) => {
          this.redisDao.updateRip(rip)
          .then(() => promise.resolve(rip))
          .catch(() => {
            if (retries > 0) {
              this.redisDao.getRipAndWatch(rip.url)
              .then((latestRip) => {
                // optimistically update rip ripRecord & add jack if jackDecision
                let latestRipUpdated = optimisticUpdater.updateRip(latestRip);
                if (jackDecision) {
                  latestRipUpdated = optimisticUpdater.incrementJacks(latestRipUpdated);
                }
                // try to write rip record again.
                updateRipInRedis(latestRipUpdated, retries - 1);
              })
              .catch(err => reject(err));
            } else {
              promise.reject(new Error(`Could not write to redis after ${maxRetries} retries`));
            }
          });
        };

        updateRipInRedis(updatedRip, maxRetries);

        return promise;
      };

      let finalRipRecord = updatedRipRecord;
      if (jackDecision) {
        finalRipRecord = optimisticUpdater.incrementJacks(updatedRipRecord);
      }

      updateRipInRedisWithRetry(finalRipRecord)
        .then((recordThatWasWrittenToRedis) => {
          // should we update mongo?
          // query redis sorted set for this url, check if it is out
          // of date based on config value in redisDaoConfig obj.
          // if it is, then call mongo dao to update rip. else resolve.
          resolve();
        })
        .catch(err => reject(err));
    });
  }

  createRip(rip, geo) {
    return new Promise((resolve, reject) => {
      logger.silly('Dao: trying to create new rip');
      this.redisDao.updateRipLastPersistedDate(rip.url)
      .then(() => this.mongoDao.createRip(rip, geo))
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
