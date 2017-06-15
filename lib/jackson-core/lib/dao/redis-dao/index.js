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

  setUserConfig(userId, config) {
    return super.setKeyWithObjectValue(userId, config);
  }

  delWhitelistedDomains() {
    return super.delKey('whitelistedDomains');
  }

  getRip(url) {
    return super.getKeyWithObjectValue(url);
  }

  delKey(url) {
    return super.delKey(url);
  }

  setRip(rip) {
    return super.setKeyWithObjectValue(rip.url, rip);
  }

  closeConnection() {
    super.closeConnection();
  }
}

export default RedisDao;
