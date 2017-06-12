import mongoose from 'mongoose';
import getWhitelistedDomains from './queries/get-whitelisted-domains';

mongoose.Promise = Promise;

class MongoDao {
  constructor(config) {
    this.connected = false;

    this.ensureConnection = () => new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        mongoose.connect(config.connectionString);
        this.db = mongoose.connection;

        this.db.once('open', () => {
          this.connected = true;
          resolve();
        });

        this.db.on('error', (err) => {
          reject(err);
        });
      }
    });
  }

  getWhitelistedDomains() {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(getWhitelistedDomains)
        .then((whitelistedDomains) => {
          resolve(whitelistedDomains);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default MongoDao;
