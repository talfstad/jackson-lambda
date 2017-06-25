import moment from 'moment';
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

  checkClientWhitelisted(ip) {
    return super.keyExists(ip);
  }

  updateRipLastPersistedDate(url) {
    // create now time to pass to it
    const secondsSinceEpoch = (moment()).unix() * 1000;
    // if want to query it we need seconds since epoch
    return super.updateRipLastPersistedDate(url, secondsSinceEpoch);
  }

  removeRip(url) {
    return super.removeRip(url);
  }

  setWhitelistClientIP(ip) {
    return super.setKeyWithObjectValue(ip, true);
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

  getRipAndWatch(url) {
    return super.getRipAndWatch(url);
  }

  setRipAndWatch(rip) {
    return super.setRipAndWatch(rip);
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
    return super.closeConnection();
  }
}

export default RedisDao;
