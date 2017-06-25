class RequestFinalization {
  constructor({ db }) {
    if (!db) throw new Error('RequestFinalization requires a DAO instance on construction');
    this.db = db;

    this.validateInputs = (inputs) => {
      const {
        jackDecision,
        decisionInformation,
      } = inputs;
      if (!jackDecision || !decisionInformation) {
        throw new Error('Invalid inputs to RequestFinalization finalizeRequest');
      }
    };
  }

  finalizeRequest(inputs) {
    return new Promise((resolve) => {
      // validate finalize inputs
      this.validateInputs(inputs);

      // SECOND TODO: 1. get final object (adds jack in)
      // and Push back to redis updated information
        // = add in retry logic to this call to redis dao (add retry logic to this class)
        //   . get&watch from redis again, call optimisticUpdater on it, add the jack in
        //     try to write it again. repeat config many times.

      // THIRD TODO: 2. call to redis dao to -> Whitelist client IP
        // = redis dao call whitelistClientIP uses EXPIRE to expire based on config value.

      // FOURTH TODO: 3. Persist updated rip to mongo if necessary
        // based on config value (not user config)
        // - query sorted set for last time we persisted this URL.
        // If no value, or outdated value, update set with now() time as score
        // persist the same object we persisted to redis successfully to mongo

      // FIFTH TODO: 4. Clear old cache items and persist to mongo
        // based on config value (not userConfig)
        // - using watch/multi/exec: query sorted set for all scores older than config
        // - delete them, if changed ignore someone else did it already move on..
        // query each url and aggreate the data into a bulk update.

    // FIRST TODO: whenever we write to mongo, also write updated score to sorted
    // set of rips..


      resolve();
    });
  }
}

export default RequestFinalization;
