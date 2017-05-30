import mapRequestToCoreInputs from './lib/map-request-to-core-inputs';

const haveValidFunctionInputParams = (inputs) => {
  const {
    requestMethod,
    requestHeaders,
    requestPath,
  } = inputs;
  const requestHost = requestHeaders.Host;

  const validateInputsExist = () => {
    if (!requestMethod || !requestHost || !requestPath) {
      return false;
    }
    return true;
  };

  return validateInputsExist();
};

const getCoreInputs = (inputs) => {
  const {
    requestMethod,
    requestHeaders,
    requestPath,
  } = inputs;
  const requestHost = requestHeaders.Host;

  const validHost = mapRequestToCoreInputs[requestHost];
  if (!validHost) {
    return false;
  }
  const validPath = validHost[requestPath];
  if (!validPath) {
    return false;
  }

  const coreInputs = validPath[requestMethod];
  if (!coreInputs) {
    return false;
  }

  return coreInputs(inputs);
};

exports.validate = (inputs) => {
  const promise = new Promise((resolve, reject) => {
    const coreInputs = getCoreInputs(inputs);
    if (haveValidFunctionInputParams(inputs) && coreInputs) {
      resolve(coreInputs);
    } else {
      reject();
    }
  });

  return promise;
};
