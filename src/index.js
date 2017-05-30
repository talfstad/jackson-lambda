import path from 'path';
import requestValidator from '../lib/request-validator';

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
      const response = {
        statusCode: 200,
      };
      callback(null, response);
    })
    .catch(() => {
      const { redirectHost } = event.stageVariables;
      const response = {
        statusCode: 302,
        headers: {
          Location: `https://${path.join(redirectHost, event.path)}`,
        },
      };
      callback(null, response);
    });
};
