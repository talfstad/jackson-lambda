import MongoConnectionAndQueries from './mongo-connection-and-queries';

class MongoDao extends MongoConnectionAndQueries {
  constructor({ config }) {
    super({ config });
  }

  getWhitelistedDomains() {
    return super.getWhitelistedDomains();
  }

  getRip(url) {
    return super.getRip(url);
  }

  getUserConfig(uuid) {
    return super.getUserConfig(uuid);
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
