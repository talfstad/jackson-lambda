import config from '../../config/lib/request-validator';

const haveValidInputParams = ({
  requestMethod,
  requestHost,
  requestPath,
}) => {
  const validateInputsExist = () => {
    if (!requestMethod || !requestHost || !requestPath) {
      return false;
    }
    return true;
  };

  const validateRequestIsValid = () => {
    const validHost = config.validRequestForHost[requestHost];
    if (!validHost) {
      return false;
    }
    const validPath = validHost[requestPath];
    if (!validPath) {
      return false;
    }
    const validMethod = validPath.indexOf(requestMethod);
    if (validMethod < 0) {
      return false;
    }
    return true;
  };
  return validateInputsExist() && validateRequestIsValid();
};

exports.validate = ({
  requestMethod,
  requestHost,
  requestPath,
}) => {
  const promise = new Promise((resolve, reject) => {
    if (haveValidInputParams({
      requestMethod,
      requestHost,
      requestPath,
    })) {
      resolve();
    } else {
      reject();
    }
  });
  return promise;
};
