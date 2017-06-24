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

      console.log('WE DID GET TO REQUEST FINALIZATION. IS THIS DURING A FORWARD???');

      resolve();
    });
  }
}

export default RequestFinalization;
