import path from 'path';

exports.forwardResponse = ({ redirectHost, requestPath }) => ({
  statusCode: 302,
  headers: {
    Location: `https://${path.join(redirectHost, requestPath)}`,
  },
});
