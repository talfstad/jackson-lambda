import RedisDb from './redisdb';

class RedisDao extends RedisDb {
  constructor({ config }) {
    super({ config });
  }

  getWhitelistedDomains() {
    return super.getKeyWithObjectValue('whitelistedDomains');
  }

  setWhitelistedDomains(whitelistedDomains) {
    return super.setKeyWithObjectValue('whitelistedDomains', whitelistedDomains);
  }

  getUserConfig(uuid) {
    return super.getKeyWithObjectValue(uuid);
  }

  setUserConfig(uuid, config) {
    return super.setKeyWithObjectValue(uuid, config);
  }

  getRip(url) {
    return super.getKeyWithObjectValue(url);
  }

  setRip(rip) {
    return super.setKeyWithObjectValue(rip.url, rip);
  }

  closeConnection() {
    super.closeConnection();
  }
}

export default RedisDao;
