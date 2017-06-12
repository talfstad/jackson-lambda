import mongoose from 'mongoose';
import getWhitelistedDomains from './queries/get-whitelisted-domains';

mongoose.Promise = Promise;

class MongoDao {
  constructor({ config }) {
    this.connected = false;
    this.config = config;
    this.db = null;

    this.ensureConnection = () => new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        mongoose.connect(this.config.host);
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

  closeConnection() {
    mongoose.connection.close();
    this.connected = false;
  }
}

export default MongoDao;
