import moment from 'moment';
import logger from 'npmlog';
import redis from 'redis';
import { logLevel } from '../../../config';

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

  queryRecordsToPersistAndUpdateLastPersisted(persistRipEveryNSeconds) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const upperLimitToPersist = moment().subtract(persistRipEveryNSeconds, 'seconds').unix();
          const newTime = moment().unix();

          // This is a lua script which will run on redis atomically.
          this.db.eval(`
            -- 1. Query all out of date records
            local outOfDateRipKeys = redis.call("ZRANGEBYSCORE", "${this.ripLastPersistedKey}", "-inf", "${upperLimitToPersist}")
            --
            -- 2. If not null do the rest, else return.
            if next(outOfDateRipKeys) ~= nil then
              --
              -- 3. Modify out of date results to update their score.
              local updatedScoresInput = {}
              for count = 1, #outOfDateRipKeys do
                table.insert(updatedScoresInput, ${newTime})
                table.insert(updatedScoresInput, outOfDateRipKeys[count])
              end
              --
              -- 4. Update out of date scores
              redis.call("ZADD", "test:multi:zadd", unpack(updatedScoresInput))
              --
              -- 5. Get all rip values for out of date rip keys and return them.
              local outOfDateRips = redis.call("MGET", unpack(outOfDateRipKeys))
              --
              -- 6. Return the out of date rips
              return outOfDateRips
            end
            `, '', (err, outOfDateRips) => {
              if (err) reject(err);
              else {
                resolve((outOfDateRips || [])
                  // remove empties
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
          multi.exec((err, replies) => {
            if (err) reject(err);
            else {
              const [setReply] = replies;
              resolve(setReply); // Should send first reply back
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  setKeyWithObjectValueAndExpire(key, val, expire) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const multi = this.db.multi();
          multi.set(key, JSON.stringify(val));
          multi.expire(key, expire);
          multi.exec((err, replies) => {
            if (err) reject(err);
            else {
              const [setReply] = replies;
              resolve(setReply);
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
        .then((response) => {
          resolve(response);
        })
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
          const multi = this.db.multi();
          multi.get(url);
          multi.watch(url);
          multi.exec((err, replies) => {
            if (err) reject(err);

            const [getReply] = replies;
            if (!getReply) reject(new Error(`Could not get Rip ${url}`));
            else resolve(JSON.parse(getReply)); // Should send first reply back
          });
        });
    });
  }

  setRipAndWatch(rip) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const multi = this.db.multi();
          multi.set(rip.url, JSON.stringify(rip));
          multi.watch(rip.url);
          multi.exec((err, replies) => {
            if (err) reject(err);
            const [setReply] = replies;
            resolve(setReply); // Should send first reply back
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
          this.db.set(key, JSON.stringify(value));
          resolve();
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
