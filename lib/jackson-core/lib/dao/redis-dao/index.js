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

  getUrlRecord(url) {
    return super.getKeyWithObjectValue(url);
  }

  setUrlRecord(urlRecord) {
    return super.setKeyWithObjectValue(urlRecord.url, urlRecord);
  }

  closeConnection() {
    super.closeConnection();
  }
}

export default RedisDao;
