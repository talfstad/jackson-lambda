import RedisConnectionAndQueries from './redis-connection-and-queries';

class RedisDao extends RedisConnectionAndQueries {
  constructor({ config }) {
    super({ config });
  }

  getWhitelistedDomains() {
    return super.getKeyWithObjectValue('whitelistedDomains');
  }

  setWhitelistedDomains(whitelistedDomains) {
    return super.setKeyWithObjectValue('whitelistedDomains', whitelistedDomains);
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
