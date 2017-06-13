import MongoConnectionAndQueries from './mongo-connection-and-queries';

class MongoDao extends MongoConnectionAndQueries {
  constructor({ config }) {
    super({ config });
  }

  getWhitelistedDomains() {
    return super.getWhitelistedDomains();
  }

  closeConnection() {
    return super.closeConnection();
  }
}

export default MongoDao;
