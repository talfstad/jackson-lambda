import path from 'path';
import requestValidator from '../lib/request-validator';
import forwardingHostMapping from '../config/src/forwarding-host-mapping';

exports.handler = (event, context, callback) => {
  const requestHost = event.headers.Host;
  const requestPath = event.path;
  const requestMethod = event.httpMethod;

  requestValidator.validate({
    requestHost,
    requestMethod,
    requestPath,
  })
    .then(() => {
      // request is valid so handle it...
    })
    .catch(() => {
      const response = {
        statusCode: 302,
        headers: {
          Location: `https://${path.join(forwardingHostMapping[requestHost], event.path)}`,
        },
      };
      callback(null, response);
    });
};
