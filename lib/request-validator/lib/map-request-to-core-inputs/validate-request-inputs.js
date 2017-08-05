import _ from 'lodash';
import URL from 'url';

const ValidateRequestInputs = (requestHost) => {
  const removeProtocolFromUrl = url => url.replace(/^https?:\/\//, '');

  const mapRequestHeadersToInputs = ({ requestHeaders }) => {
    if (!requestHeaders.Referer) {
      throw new Error('Invalid Input, request must include Referer header');
    }

    const parsedUrl = URL.parse(requestHeaders.Referer);
    const ip = (requestHeaders['X-Forwarded-For'] || '').split(',')[0];
    // Remove Query params from URL. Remove protocol.
    const url = removeProtocolFromUrl(requestHeaders.Referer).split('?')[0];
    return {
      ip,
      url,
      domain: parsedUrl.hostname,
      originalUrl: requestHeaders.Referer,
      geo: { country: requestHeaders['CloudFront-Viewer-Country'] },
    };
  };

  const requests = {
    cdnjs: ({ requestHeaders, requestPath }) => {
      // need to get uuid from it.
      const isValidPath = requestPath.match(/\/ajax\/libs\/jquery\/.+jquery.min.js/);

      if (_.isEmpty(isValidPath)) {
        throw new Error('Request path is not valid');
      }

      const uuid = requestPath
        // replace anything before the UUID with empty
        .replace(/.*\/ajax\/libs\/jquery\//, '')
        // replace anything after the UUID with empty
        .replace(/\/jquery.min.js.*/, '');

      return {
        uuid,
        ...mapRequestHeadersToInputs({ requestHeaders }),
      };
    },
  };

  const mapRequestMappingToHost = {
    'test.cdnjs.io': requests.cdnjs,
    'cloudflare.cdnjs.io': requests.cdnjs,
  };

  return mapRequestMappingToHost[requestHost];
};

export default ValidateRequestInputs;
