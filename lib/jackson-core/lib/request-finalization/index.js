import OptimisticUpdater from '../optimistic-updater';

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
    return new Promise((resolve, reject) => {
      // validate finalize inputs
      this.validateInputs(inputs);

      const {
        decisionInformation,
        jackDecision,
      } = inputs;
      const {
        updatedRipRecord,
        requestInputs,
      } = decisionInformation;

      const optimisticUpdater = new OptimisticUpdater(requestInputs);

      // updating rip in redis, and persisting to mongo if necessary
      this.db.updateRip({
        jackDecision,
        updatedRipRecord,
        optimisticUpdater,
      })
      .then(() => {
        console.log('HEY TREV we done.. next we will whitelistClientIP');
      })
      .catch(err => reject(err));

      // SECOND TODO: 1. get final object (adds jack in)
      // and Push back to redis updated information
        // = add in retry logic to this call to redis dao (add retry logic to this class)
        //   . get&watch from redis again, call optimisticUpdater on it, add the jack in
        //     try to write it again. repeat config many times.

          // Persist updated rip to mongo if necessary (update score in redis sorted list
          // if we persist). based on config value (not user config)
          // - query sorted set for last time we persisted this URL.
          // If no value, or outdated value, update set with now() time as score
          // persist the same object we persisted to redis successfully to mongo

        // THIRD TODO: 2. call to redis dao to -> Whitelist client IP
        // = redis dao call whitelistClientIP uses EXPIRE to expire based on config value.

      // FOURTH TODO: 4. Clear old cache items and persist to mongo
        // based on config value (not userConfig)
        // - using watch/multi/exec: query sorted set for all scores older than config
        // - delete them, using multi i can query using zrangebyscore
        //   and delete using zremrangebyscore
        // query each url to get rip data to persist and aggreate the data into a bulk update.

      resolve();
    });
  }
}

export default RequestFinalization;
