import logger from 'npmlog';
import mongoose from 'mongoose';
import WhitelistedDomain from './models/whitelisted-domain';
import User from './models/user';
import Rip from './models/rip';
import { logLevel } from '../../../config';

logger.level = logLevel;

class MongoDb {
  constructor({ config }) {
    this.connected = false;
    this.config = config;
    mongoose.Promise = global.Promise;
    this.db = mongoose.connection;
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

  createUser(user) {
    logger.silly('MongoDb: trying to create user');
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly('got connection trying to create a user');
          User.create({ ...user, created_on: new Date(), last_updated: new Date() })
            .then((newUserRecord) => {
              logger.silly(`MongoDb createUser query success: ${newUserRecord}`);
              resolve(newUserRecord);
            })
            .catch((err) => {
              logger.silly(`MongoDb createUser query failed: ${err}`);
              reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  removeUser(user) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          const { name, email } = user;
          User.remove({ name, email })
            .then((response) => {
              logger.silly(`MongoDb: removeUser: Successfully removed user: ${user}`);
              resolve(response);
            })
            .catch((err) => {
              logger.silly(`MongoDb removeUser: Failed to remove user: ${user}: ${err}`);
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
              logger.silly(`MongoDb: getUserFromUUID successfully got user with uuid ${uuid} => ${userRecord}`);
              if (!userRecord) throw new Error(`the UUID ${uuid} does not map to any user!`);
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

  createRip(ripRecord) {
    logger.silly('MongoDb: trying to create rip');
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly('got connection trying to create a rip!');
          Rip.create({ ...ripRecord, created_on: new Date(), last_updated: new Date() })
            .then((response) => {
              logger.silly(`MongoDb createRip query success: ${response}`);
              resolve();
            })
            .catch((err) => {
              logger.silly(`MongoDb createRip query failed: ${err}`);
              reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  closeConnection() {
    return new Promise((resolve) => {
      try {
        mongoose.disconnect(() => {
          this.connected = false;
          mongoose.connection.removeAllListeners();
          logger.silly('Successfully Closed connection to MongoDb');
          resolve();
        });
      } catch (err) {
        resolve();
      }
    });
  }
}

export default MongoDb;