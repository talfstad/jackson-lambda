import redis from 'redis';

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

  setKeyWithObjectValue(key, value) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
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
          resolve(JSON.parse(value));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  closeConnection() {
    this.db.quit();
    super.connected = false;
  }
}

export default RedisQueries;
