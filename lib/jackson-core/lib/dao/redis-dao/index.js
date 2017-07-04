import moment from 'moment';
import RedisDb from './redisdb';

class RedisDao extends RedisDb {
  constructor({ config, cachedDb }) {
    super({ config, cachedDb });
    this.config = config;
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

  updateRip(rip) {
    return super.updateRip(rip);
  }

  queryLastPersistedAndUpdateIfOutOfDate(rip, persistRipEveryNSeconds) {
    return super.queryLastPersistedAndUpdateIfOutOfDate(rip, persistRipEveryNSeconds);
  }

  queryRecordsToPersistAndRemoveThem(persistAndPurgeOldRipsFromCacheEveryNSeconds) {
    return super.queryRecordsToPersistAndRemoveThem(persistAndPurgeOldRipsFromCacheEveryNSeconds);
  }

  updateRipLastPersistedDate(url, newScore) {
    // create now time to pass to it
    const secondsSinceEpoch = newScore || (moment()).unix();
    // if want to query it we need seconds since epoch
    return super.updateRipLastPersistedDate(
      url,
      secondsSinceEpoch,
    );
  }

  removeRip(url) {
    return super.removeRip(url);
  }

  setWhitelistClientIP(ip) {
    return super.setKeyWithObjectValueAndExpire(ip, true, this.config.expireClientIPEveryNSeconds);
  }

  getUserConfig(uuid) {
    return super.getKeyWithObjectValue(uuid);
  }

  setUserConfig(userId, config) {
    return super.setKeyWithObjectValueAndExpire(
      userId, config, this.config.clearUserConfigFromCacheEveryNSeconds);
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
