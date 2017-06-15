import logger from 'npmlog';
import mongoose from 'mongoose';
import WhitelistedDomain from './models/whitelisted-domain';
import User from './models/user';
import Rip from './models/rip';
import { logLevel } from '../../../config';

logger.level = logLevel;
mongoose.Promise = Promise;

class MongoDb {
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
        this.db = mongoose.connection;

        mongoose.connect(this.config.host, {
          server: {
            socketOptions: {
              connectionTimeout: 500,
            },
          },
        });

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

  whitelistDomain(name) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          WhitelistedDomain.create({ name, created_on: new Date() })
            .then((response) => {
              logger.silly(`MongoDb: whitelistDomain: Successfully whitelisted ${name}`);
              resolve(response);
            })
            .catch((err) => {
              logger.silly(`MongoDb whitelistDomain: Failed to whitelist ${name}: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoDb failed to get mongo connection');
          return reject(err);
        });
    });
  }

  removeWhitelistedDomain(name) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          WhitelistedDomain.remove({ name })
            .then((response) => {
              logger.silly(`MongoDb: removeWhitelistDomain: Successfully removed ${name}`);
              resolve(response);
            })
            .catch((err) => {
              logger.silly(`MongoDb removeWhitelistDomain: Failed to remove ${name}: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoDb failed to get mongo connection');
          return reject(err);
        });
    });
  }

  getRip(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          Rip.findOne({ url })
            .then((ripRecord) => {
              logger.silly(`MongoDb: got record: ${ripRecord} for this url: ${url}`);
              resolve(ripRecord);
            })
            .catch((err) => {
              logger.silly(`MongoDb getRip query failed: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoDb failed to get mongo connection');
          return reject(err);
        });
    });
  }

  removeRip(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          Rip.remove({ url })
            .then((response) => {
              logger.silly(`MongoDb: removeRip: Successfully removed rip: ${url}`);
              resolve(response);
            })
            .catch((err) => {
              logger.silly(`MongoDb removeRip: Failed to remove rip ${url}: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoDb failed to get mongo connection');
          return reject(err);
        });
    });
  }

  getUserFromUUID(uuid) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          User.findOne({
            uuids: {
              $elemMatch: {
                uuid,
              },
            },
          })
            .then((userRecord) => {
              logger.silly(`MongoDb: getUserFromUUID successfully got user: ${userRecord}`);
              resolve(userRecord);
            })
            .catch((err) => {
              logger.silly(`MongoDb getUserFromUUID query failed: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoDb failed to get mongo connection');
          return reject(err);
        });
    });
  }

  createNewRip(ripRecord) {
    logger.silly('MongoDb: trying to create new rip');
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly('got connection trying to create new a rip!');
          Rip.create({ ...ripRecord, created_on: new Date() })
            .then((response) => {
              logger.silly(`MongoDb createNewRip query success: ${response}`);
              resolve();
            })
            .catch((err) => {
              logger.silly(`MongoDb createNewRip query failed: ${err}`);
              reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  closeConnection() {
    mongoose.connection.close();
    this.connected = false;
  }
}

export default MongoDb;
