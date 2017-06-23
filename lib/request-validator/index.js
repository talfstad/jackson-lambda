import mapRequestToCoreInputs from './lib/map-request-to-core-inputs';

class RequestValidator {
  static validate(inputs) {
    const validateInputParams = () => {
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

    const promise = new Promise((resolve, reject) => {
      const coreInputs = mapRequestToCoreInputs(inputs);
      if (validateInputParams(inputs) && coreInputs) {
        resolve(coreInputs);
      } else {
        reject(new Error('Invalid inputs to RequestValidator'));
      }
    });

    return promise;
  }
}

export default RequestValidator;
