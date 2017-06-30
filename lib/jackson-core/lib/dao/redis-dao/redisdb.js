import moment from 'moment';
import logger from 'npmlog';
import redis from 'redis';
import { logLevel } from '../../../config';
import luaQueryOutdatedAndPurge from './lua/query-outdated-and-purge';
import luaQueryUpdateShouldPersist from './lua/query-update-should-persist';

logger.level = logLevel;

class RedisQueries {
  constructor({ config }) {
    this.connected = false;
    this.db = null;
    this.config = config;
    this.ripLastPersistedKey = 'rip:last:persisted';
  }

  ensureConnection() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        this.db = redis.createClient(this.config);

        this.db.on('ready', () => {
          this.connected = true;
          resolve();
        });

        this.db.on('error', (err) => {
          reject(err);
        });
      }
    });
  }

  removeRipFromLastPersisted(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly(`RedisDB removeRipFromLastPersisted removing this url: ${url}`);
          this.db.zrem(this.ripLastPersistedKey, url, (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
        .catch(err => reject(err));
    });
  }

  removeRip(url) {
    return new Promise((resolve, reject) => {
      logger.silly(`RedisDB removeRip removing this rip: ${url}`);
      this.ensureConnection()
        .then(() => this.removeRipFromLastPersisted(url))
        .then(() => this.delKey(url))
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  queryLastPersistedAndUpdateIfOutOfDate(rip, persistRipEveryNSeconds) {
    // query last time this rip was persisted in sorted set. Update it
    // transactionally if it is out of date, or null. If it is updated
    // we will persist it. so we resolve()
    // if not out of date, we don't want to persist. so we reject() and
    // break the promise chain this is tied to.
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const upperLimitToPersist = moment().subtract(persistRipEveryNSeconds, 'seconds').unix();
          const newTime = moment().unix();

          this.db.eval(luaQueryUpdateShouldPersist(rip, this.ripLastPersistedKey, upperLimitToPersist, newTime), '', (err, shouldPersist) => {
            if (err || !shouldPersist) reject(err);
            else resolve();
          });
        });
    });
  }

  queryRecordsToPersistAndRemoveThem(persistAndPurgeOldRipsFromCacheEveryNSeconds) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const upperLimitToPersist = moment().subtract(persistAndPurgeOldRipsFromCacheEveryNSeconds, 'seconds').unix();

          this.db.eval(luaQueryOutdatedAndPurge(this.ripLastPersistedKey, upperLimitToPersist), '', (err, outOfDateRips) => {
            if (err) reject(err);
            else {
              resolve((outOfDateRips || [])
                // remove empties. They shouldn't really be
                // in this result but during testing they are sometimes
                .filter(rip => rip !== null)
                // parse it back to from JSON
                .map(rip => JSON.parse(rip)),
              );
            }
          });
        });
    });
  }

  updateRipLastPersistedDate(url, secondsSinceEpoch) {
    // write this url into the sorted set for rip:last:persisted
    // with the score of secondsSinceEpoch.
    // ZADD rip:last:persisted <secondsSinceEpoch> <url>

    return new Promise((resolve, reject) => {
      logger.silly(`RedisDB updateRipLastPersistedDate adding to sorted set: ${secondsSinceEpoch} score for url: ${url}`);

      this.ensureConnection()
        .then(() => this.db.zadd(this.ripLastPersistedKey, secondsSinceEpoch, url, (err) => {
          if (err) reject(err);
          else resolve();
        }))
        .catch(err => reject(err));
    });
  }

  setKeyWithObjectValueMulti(key, val) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const multi = this.db.multi();
          multi.set(key, JSON.stringify(val));
          multi.exec((err, reply) => {
            // if reply is null, update failed.
            // if it is [ 'OK' ] update success
            if (err || !reply) reject(err);
            else resolve(); // Should send first reply back
          });
        })
        .catch(err => reject(err));
    });
  }

  setKeyWithObjectValueAndExpire(key, val, expire) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.set(key, JSON.stringify(val), (error) => {
            if (error) reject(error);
            else {
              this.db.expire(key, expire, (err) => {
                if (err) reject(err);
                else {
                  resolve();
                }
              });
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  updateRip(rip) {
    return new Promise((resolve, reject) => {
      if (!('url' in rip)) reject(new Error('RedisDB updateRip must have url key'));

      logger.silly(`RedisDB updateRip updating this rip url: ${rip.url}`);
      this.setKeyWithObjectValueMulti(rip.url, rip)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  keyExists(key) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.exists(key, (err, exists) => {
            if (!exists || err) reject(err);
            else resolve(exists);
          });
        })
        .catch(err => reject(err));
    });
  }

  getRipAndWatch(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.watch(url, (error) => {
            if (error) reject(error);
            else {
              this.db.get(url, (err, getReply) => {
                if (err || !getReply) reject(err);
                else {
                  resolve(JSON.parse(getReply));
                }
              });
            }
          });
        });
    });
  }

  setRipAndWatch(rip) {
    return new Promise((resolve, reject) => {
      logger.silly(`RedisDb: setRipAndWatch: \nkey: ${rip.url}`);

      this.ensureConnection()
        .then(() => {
          this.db.set(rip.url, JSON.stringify(rip), (err) => {
            if (err) reject(err);
            else {
              this.db.watch(rip.url, (error, response) => {
                if (error) reject(error);
                resolve(response);
              });
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  getKey(key) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          this.db.get(key, (err, value) => {
            if (err) reject(err);
            else resolve(value);
          });
        })
        .catch(err => reject(err));
    });
  }

  delKey(key) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly(`RedisDb: delKey: \nkey: ${key}`);
          this.db.del(key, (err, value) => {
            if (err) reject(err);
            else resolve(value);
          });
        })
        .catch(err => reject(err));
    });
  }

  setKeyWithObjectValue(key, value) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly(`RedisDb: SetKeyWithObjectValue: \nkey: ${key} value: ${value}`);
          this.db.set(key, JSON.stringify(value), (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
        .catch(err => reject(err));
    });
  }

  getKeyWithObjectValue(key) {
    return new Promise((resolve, reject) => {
      this.keyExists(key)
        .then(() => this.getKey(key))
        .then((value) => {
          logger.silly(`RedisDb: got value: ${value} for this key: ${key}`);
          resolve(JSON.parse(value));
        })
        .catch((err) => {
          logger.silly(`RedisDb: error getting key with object value: ${err}`);
          reject(err);
        });
    });
  }

  closeConnection() {
    return new Promise((resolve) => {
      try {
        this.db.quit(() => {
          this.connected = false;
          logger.silly('Successfully Closed connection to RedisDb');
          resolve();
        });
      } catch (err) {
        resolve();
      }
    });
  }
}

export default RedisQueries;
