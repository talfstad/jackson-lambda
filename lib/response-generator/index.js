import path from 'path';

class RequestGenerator {
  static forwardResponse({ redirectHost, requestPath }) {
    return {
      statusCode: 302,
      headers: {
        Location: `https://${path.join(redirectHost, requestPath)}`,
      },
    };
  }
}

export default RequestGenerator;
