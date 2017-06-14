import logger from 'npmlog';
import mongoose from 'mongoose';
import WhitelistedDomain from './models/whitelisted-domain';
import User from './models/user';
import Rip from './models/rip';
import { logLevel } from '../../../config';

logger.level = logLevel;
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

  getRip(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          Rip.findOne({ url })
            .then((ripRecord) => {
              logger.silly(`MongoConnectionAndQueries: got record: ${ripRecord} for this url: ${url}`);
              resolve(ripRecord);
            })
            .catch((err) => {
              logger.silly(`MongoConnectionAndQueries getRip query failed: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoConnectionAndQueries failed to get mongo connection');
          return reject(err);
        });
    });
  }

  getUserConfig(uuid) {
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
            .then(({ config }) => {
              logger.silly(`MongoConnectionAndQueries: successfully got userConfig: ${config} for this user: ${uuid}`);
              resolve(config);
            })
            .catch((err) => {
              logger.silly(`MongoConnectionAndQueries getUserConfig query failed: ${err}`);
              reject(err);
            });
        })
        .catch((err) => {
          logger.silly('MongoConnectionAndQueries failed to get mongo connection');
          return reject(err);
        });
    });
  }

  createNewRip(ripRecord) {
    logger.silly('MongoConnectionAndQueries: trying to create new rip');
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => {
          logger.silly('got connection trying to create new a rip!');
          Rip.create(ripRecord)
            .then((response) => {
              logger.silly(`MongoConnectionAndQueries createNewRip query success: ${response}`);
              resolve();
            })
            .catch((err) => {
              logger.silly(`MongoConnectionAndQueries createNewRip query failed: ${err}`);
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

export default MongoConnectionAndQueries;
