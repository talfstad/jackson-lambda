import validateRequestInputs from './validate-request-inputs';

const MapRequestToCoreInputs = (inputs) => {
  const {
    requestMethod,
    requestHeaders,
    requestPath,
  } = inputs;
  const requestHost = requestHeaders.Host;

  const validHost = validateRequestInputs(requestHost);
  if (!validHost) {
    throw new Error('Request must have a valid Host header key');
  }

  const validPath = validHost[requestPath];
  if (!validPath) {
    throw new Error('Request must have a valid path header key');
  }

  const mapRequestToCoreInputs = validPath[requestMethod];
  if (!mapRequestToCoreInputs) {
    throw new Error('Request must have a valid mapping to core inputs');
  }

  return mapRequestToCoreInputs(inputs);
};

export default MapRequestToCoreInputs;
