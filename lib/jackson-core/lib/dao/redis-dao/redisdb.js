import logger from 'npmlog';
import redis from 'redis';
import { logLevel } from '../../../config';

logger.level = logLevel;

class RedisQueries {
  constructor({ config }) {
    this.connected = false;
    this.db = null;
    this.config = config;
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

  updateRipLastPersistedDate(url, secondsSinceEpoch) {
    // write this url into the sorted set for rip:last:persisted
    // with the score of secondsSinceEpoch.
    // ZADD rip:last:persisted <secondsSinceEpoch> <url>

    const ripLastPersistedKey = 'rip:last:persisted';
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly(`RedisDB updateRipLastPersistedDate adding to sorted set: ${secondsSinceEpoch} score for url: ${url}`);
          this.db.zadd(ripLastPersistedKey, secondsSinceEpoch, url, (err) => {
            if (err) reject(err);
            else resolve();
          });
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
            else resolve(getReply); // Should send first reply back
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
