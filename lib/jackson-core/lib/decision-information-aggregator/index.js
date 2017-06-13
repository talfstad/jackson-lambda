class DecisionInformationAggregator {
  constructor({ db }) {
    this.db = db;
  }

  aggregate(inputs) {
    // const { url, uuid } = inputs;
    const { url } = inputs;
    return new Promise((resolve, reject) => {
      this.db.getUrlRecord(url)
        // .then(() => this.db.getUserConfig(uuid))
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default DecisionInformationAggregator;
