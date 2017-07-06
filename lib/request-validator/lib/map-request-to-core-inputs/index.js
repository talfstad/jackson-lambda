import validateRequestInputs from './validate-request-inputs';

const MapRequestToCoreInputs = (inputs) => {
  const {
    requestHeaders,
  } = inputs;
  const requestHost = requestHeaders.Host;

  const mapHostToUUID = validateRequestInputs(requestHost);
  if (!mapHostToUUID) {
    throw new Error('Request must have a valid Host header key');
  }

  return mapHostToUUID(inputs);
};

export default MapRequestToCoreInputs;
