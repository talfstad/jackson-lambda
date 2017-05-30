import path from 'path';
import requestValidator from '../lib/request-validator';

exports.handler = (event, context, callback) => {
  requestValidator.validate()
    .then(() => {
      // request is valid so handle it...
    })
    .catch(() => {
      const response = {
        statusCode: 302,
        headers: {
          Location: `https://${path.join('cdnjs.cloudflare.com', event.path)}`,
        },
      };
      callback(null, response);
    });
};
