import logger from 'npmlog';
import RedisDao from './redis-dao';
import MongoDao from './mongo-dao';
import { logLevel } from '../../../../config';

logger.level = logLevel;

class Dao {
  constructor({ config }) {
    this.config = config;

    this.redisDao = new RedisDao({
      config: config.redisDaoConfig(),
    });

    this.mongoDao = new MongoDao({ config: config.mongoDaoConfig() });
  }

  getRedisDao() {
    return this.redisDao;
  }

  getMongoDao() {
    return this.mongoDao;
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
              this.redisDao.setUserConfig(user._id, userConfig)
                .then(() => resolve(userConfig));
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

  updateRipInRedisWithRetry({
    jackDecision,
    updatedRipRecord,
    optimisticUpdater,
  }) {
    return new Promise((resolve, reject) => {
      const { maxRetries } = this.config.redisDaoConfig();
      const updateRipInRedis = (rip, retries) => {
        this.redisDao.updateRip(rip)
        .then(() => resolve(rip))
        .catch(() => {
          if (retries > 0) {
            this.redisDao.getRipAndWatch(rip.url)
            .then((latestRip) => {
              logger.silly(`Dao: Retrying updateRipInRedisWithRetry. ${retries} retries left`);
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
            reject(new Error(`Could not write to redis after ${maxRetries} retries`));
          }
        });
      };

      updateRipInRedis(updatedRipRecord, maxRetries);
    });
  }

  persistAllOutdatedRips() {
    return new Promise((resolve, reject) => {
      const { persistAndPurgeOldRipsFromCacheEveryNSeconds } = this.config.redisDaoConfig();
      this.redisDao.queryRecordsToPersistAndRemoveThem(persistAndPurgeOldRipsFromCacheEveryNSeconds)
        .then(recordsToPersist => this.mongoDao.persistOutdatedRips(recordsToPersist))
        .then(() => {
          resolve();
        })
        .catch(err => reject(err));
    });
  }

  persistRipIfOutdated(rip) {
    return new Promise((resolve) => {
      const { persistRipEveryNSeconds } = this.config.mongoDaoConfig();
      this.redisDao.queryLastPersistedAndUpdateIfOutOfDate(rip, persistRipEveryNSeconds)
        .then(() => this.mongoDao.updateRip(rip))
        .then(() => resolve())
        // if not persisting it breaks promise chain.
        .catch(() => {
          resolve();
        });
    });
  }

  updateRip({
    jackDecision,
    updatedRipRecord,
    optimisticUpdater,
  }) {
    return new Promise((resolve, reject) => {
      let finalRipRecord = updatedRipRecord;
      if (jackDecision) {
        finalRipRecord = optimisticUpdater.incrementJacks(updatedRipRecord);
      }
      this.updateRipInRedisWithRetry({
        jackDecision,
        optimisticUpdater,
        updatedRipRecord: finalRipRecord,
      })
        .then(rip => this.persistRipIfOutdated(rip))
        .then(() => this.persistAllOutdatedRips())
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  createRip(rip, geo) {
    return new Promise((resolve, reject) => {
      logger.silly('Dao: trying to create new rip');
      this.redisDao.updateRipLastPersistedDate(rip.url)
      .then(() => this.mongoDao.createRip(rip, geo))
      .then(() => resolve())
      .catch(err => reject(err));
    });
  }

  whitelistClientIP(ip) {
    return new Promise((resolve, reject) => {
      logger.silly(`whitelistClientIP: ${ip}`);
      this.redisDao.setWhitelistClientIP(ip)
        .then(() => resolve())
        .catch(err => reject(err));
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
      this.redisDao.closeConnection()
        .then(() => this.mongoDao.closeConnection())
        .then(() => resolve())
        .catch(err => resolve(err));
    });
  }
}

export default Dao;
