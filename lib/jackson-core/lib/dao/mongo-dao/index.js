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

  createUser(user) {
    return super.createUser(user);
  }

  removeUser(user) {
    return super.removeUser(user);
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

  createRip(inputs) {
    return super.createRip(inputs);
  }

  closeConnection() {
    return super.closeConnection();
  }
}

export default MongoDao;
