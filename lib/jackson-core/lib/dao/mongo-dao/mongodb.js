import _ from 'lodash';
import logger from 'npmlog';
import moment from 'moment';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import WhitelistedDomain from './models/whitelisted-domain';
import User from './models/user';
import Rip from './models/rip';
import { logLevel } from '../../../config';

logger.level = logLevel;

class MongoDb {
  constructor({ config }) {
    this.config = config;
    mongoose.Promise = global.Promise;
  }

  ensureConnection() {
    return new Promise((resolve, reject) => {
      if (mongoose.connection.readyState > 0) {
        resolve();
      } else {
        logger.info('MongoDb: No cached connection!');
        mongoose.connect(this.config.host, {
          server: {
            socketOptions: {
              keepAlive: 300000,
              connectTimeoutMS: 30000,
            },
          },
          replset: {
            socketOptions: {
              keepAlive: 300000,
              connectTimeoutMS: 30000,
            },
          },
        })
          .then(() => {
            resolve();
          })
          .catch(err => reject(err));
      }
    });
  }

  setCurrentOffer(url, currentOffer) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
      .then(() => Rip.update({
        url,
      }, {
        $set: { currentOffer },
      }))
      .then(() => {
        resolve();
      })
      .catch(err => reject(err));
    });
  }

  whitelistRipsWithDomain(name) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
      .then(() => Rip.update({
        url: { $regex: `^${name}`, $options: 'i' },
      }, {
        $set: { whitelisted: true },
      }, {
        multi: true,
      }))
      .then(() => {
        resolve();
      })
      .catch(err => reject(err));
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
          WhitelistedDomain.create({
            name,
            created_on: new Date(),
            userName: 'Buildcave',
            userId: 'YGBwvpmwTaAZyD4Fh',
          })
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
          logger.silly(`MongoDb: getRip getting this rip: ${url}`);
          Rip.findOne({ url })
            .then((ripRecord) => {
              if (!ripRecord) reject(new Error(`No rip record found for url: ${url}`));
              else {
                logger.silly(`MongoDb: got record: ${ripRecord} for this url: ${url}`);
                resolve(ripRecord.toObject());
              }
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

  updateRip(rip) {
    return new Promise((resolve, reject) => {
      logger.silly(`MongoDb: updateRip: Updating rip ${rip.url}`);
      this.ensureConnection()
        .then(() => Rip.findOneAndUpdate({
          _id: rip._id,
        }, {
          $set: _.omit(rip, 'offer', 'take_rate'),
        }, {
          upsert: true,
        }))
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  removeRip(url) {
    return new Promise((resolve, reject) => {
      this.ensureConnection()
        .then(() => Rip.remove({ url }))
        .then((response) => {
          logger.silly(`MongoDb: removeRip: Successfully removed rip: ${url}`);
          resolve(response);
        })
        .catch((err) => {
          logger.silly(`MongoDb removeRip: Failed to remove rip ${url}: ${err}`);
          reject(err);
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
              resolve(userRecord.toObject());
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

  getRipWhitelisted(domain) {
    return new Promise((resolve, reject) => {
      if (!domain) throw new Error('Cannot get if rip is whitelisted. Must have a domain.');

      this.ensureConnection()
        .then(() => {
          WhitelistedDomain.findOne({ name: { $regex: `^${domain}`, $options: 'i' } })
            .then((whitelistedRecord) => {
              if (!whitelistedRecord) resolve(false);
              else {
                logger.silly(`MongoDb: getRipWhitelisted: ${domain} is whitelisted`);
                resolve(true);
              }
            })
            .catch((err) => {
              logger.silly(`MongoDb getRip query failed: ${domain}`);
              reject(err);
            });
        })
        .catch(err => reject(err));
    });
  }

  createRip(rip, geo) {
    return new Promise((resolve, reject) => {
      if (!('uuid' in rip)) throw new Error('Cannot save new Rip. Must have a uuid key.');
      if (!('url' in rip)) throw new Error('Cannot save new Rip. Must have a url key.');
      if (!('domain' in rip)) throw new Error('Cannot save new Rip. Must have a domain key.');
      if (!('originalUrl' in rip)) throw new Error('Cannot save new Rip. Must have a originalUrl key.');
      if (!geo) throw new Error('Cannot save new Rip. Must have a GEO.');

      this.ensureConnection()
        .then(() => {
          logger.silly('got connection trying to create a rip!');

          // first get the user for this uuid. then add the userName and userId
          // to the default rip value and then create the rip.
          // the test for this should prove userName and userId is on rip.
          this.getUserFromUUID(rip.uuid)
            .then((user) => {
              this.getRipWhitelisted(rip.domain)
                .then((whitelisted) => {
                  const hour = moment().format('H');

                  const defaultRip = {
                    whitelisted,
                    created_on: new Date(),
                    last_updated: new Date(),
                    userName: user.name,
                    userId: user._id,
                    archive: {
                      hourly: [
                        {
                          hour,
                          hits: [
                            {
                              cc: geo.country,
                              hits: 1,
                            },
                          ],
                        },
                      ],
                      daily: [],
                    },
                    daily_hits: 1,
                    daily_jacks: 0,
                    total_hits: 1,
                    consecutive_min_traffic: 0,
                    hits_per_min: 1,
                    take_rate: 0,
                  };

                  Rip.create({
                    ...defaultRip,
                    ...rip,
                  })
                    .then((response) => {
                      logger.silly(`MongoDb createRip query success: ${response}`);
                      resolve();
                    })
                    .catch((err) => {
                      logger.silly(`MongoDb createRip query failed: ${err}`);
                      reject(err);
                    });
                })
                .catch((err) => {
                  logger.silly(`MongoDb createRip query failed to find a user: ${err}`);
                  reject(err);
                });
            })
            .catch(err => reject(err));
        });
    });
  }

  persistOutdatedRips(rips) {
    return new Promise((resolve, reject) => {
      if (_.isEmpty(rips)) {
        resolve();
      } else {
        this.ensureConnection()
        .then(() => {
          const bulk = Rip.collection.initializeOrderedBulkOp();

          _.each(rips, (rip) => {
            bulk.find({
              _id: ObjectId(rip._id),
            }).update({ $set: _.omit(rip, ['_id', 'offer', 'take_rate']) });
          });

          bulk.execute((err) => {
            if (err) reject();
            else resolve();
          });
        });
      }
    });
  }

  closeConnection() {
    return new Promise((resolve, reject) => {
      try {
        this.ensureConnection()
        .then(() => {
          mongoose.connection.close(() => {
            mongoose.connection.removeAllListeners();
            logger.silly('Successfully Closed connection to MongoDb');
            resolve();
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default MongoDb;
