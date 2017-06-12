import RedisDao from './redis-dao';
import MongoDao from './mongo-dao';

import {
  redisDaoConfig,
  mongoDaoConfig,
} from '../../config';

class Dao {
  constructor() {
    this.redisDao = new RedisDao(redisDaoConfig);
    this.mongoDao = new MongoDao(mongoDaoConfig);
  }

  getWhitelistedDomains() {
    return new Promise((resolve, reject) => {
      this.redisDao.getWhitelistedDomains()
        .then((whitelistedDomains) => {
          resolve(whitelistedDomains);
        })
        .catch(() => {
          this.mongoDao.getWhitelistedDomains()
            .then((domains) => {
              resolve(domains);
              this.redisDao.setWhitelistedDomains(domains);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }
}

export default Dao;
