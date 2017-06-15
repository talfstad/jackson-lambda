import MongoDb from './mongodb';

class MongoDao extends MongoDb {
  constructor({ config }) {
    super({ config });
  }

  getWhitelistedDomains() {
    return super.getWhitelistedDomains();
  }

  getRip(url) {
    return super.getRip(url);
  }

  removeRip(url) {
    return super.removeRip(url);
  }

  getUserFromUUID(uuid) {
    return super.getUserFromUUID(uuid);
  }

  whitelistDomain(name) {
    return super.whitelistDomain(name);
  }

  removeWhitelistedDomain(name) {
    return super.removeWhitelistedDomain(name);
  }

  createNewRip(url) {
    const ripRecord = { url };

    return super.createNewRip(ripRecord);
  }

  closeConnection() {
    return super.closeConnection();
  }
}

export default MongoDao;
