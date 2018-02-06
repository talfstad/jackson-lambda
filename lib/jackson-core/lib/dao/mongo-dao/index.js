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

  updateRip(rip) {
    return super.updateRip(rip);
  }

  persistOutdatedRips(rips) {
    return super.persistOutdatedRips(rips);
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

  whitelistRipsWithDomain(name) {
    return super.whitelistRipsWithDomain(name);
  }

  removeWhitelistedDomain(name) {
    return super.removeWhitelistedDomain(name);
  }

  createRip(rip, geo) {
    return super.createRip(rip, geo);
  }

  closeConnection() {
    return super.closeConnection();
  }
}

export default MongoDao;
