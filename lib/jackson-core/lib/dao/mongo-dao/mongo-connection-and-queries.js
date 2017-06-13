import mongoose from 'mongoose';
import WhitelistedDomain from './models/whitelisted-domain';

mongoose.Promise = Promise;

class MongoConnectionAndQueries {
  constructor({ config }) {
    this.connected = false;
    this.config = config;
    this.db = null;
  }

  ensureConnection() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      } else {
        mongoose.connect(this.config.host, {
          server: {
            socketOptions: {
              connectionTimeout: 500,
            },
          },
        });
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
      .then(() => WhitelistedDomain.find({}))
      .then(whitelistedDomains => resolve(whitelistedDomains))
      .catch(err => reject(err));
    });
  }

  closeConnection() {
    mongoose.connection.close();
    this.connected = false;
  }
}

export default MongoConnectionAndQueries;
