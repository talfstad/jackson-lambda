import geoip from 'geoip-country-lite';

const ValidateRequestInputs = (requestHost) => {
  const removeProtocolFromUrl = url => url.replace(/^https?:\/\//, '');

  const mapRequestHeadersToInputs = ({ requestHeaders }) => {
    const ip = (requestHeaders['X-Forwarded-For'] || '').split(',')[0];
    const url = removeProtocolFromUrl(requestHeaders.Referer);
    if (!url) {
      throw new Error('Invalid Input, request must include Referer header');
    }
    return {
      ip,
      url,
      geo: geoip.lookup(ip),
    };
  };

  const requests = {
    cdnjs: {
      '/ajax/libs/jquery/3.2.1/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '3.2.1';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/ajax/libs/jquery/3.2.0/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '3.2.0';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/ajax/libs/jquery/3.1.1/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '3.1.1';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/ajax/libs/jquery/3.1.0/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '3.1.0';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/ajax/libs/jquery/3.0.0/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '3.0.0';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/ajax/libs/jquery/2.2.4/jquery.min.js': {
        GET: ({ requestHeaders }) => {
          const uuid = '2.2.4';
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
    },
    githubcdn: {
      '/jquery': {
        POST: ({ requestHeaders, requestBody }) => {
          if (!requestBody.version) {
            throw new Error('Invalid Input, request JSON body must include a version key');
          }
          const uuid = requestBody.version;
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/jquery/dist': {
        POST: ({ requestHeaders, requestBody }) => {
          if (!requestBody.version) {
            throw new Error('Invalid Input, request JSON body must include a version key');
          }
          const uuid = requestBody.version;
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
        GET: ({ requestHeaders }) => {
          const xAltReferer = requestHeaders['X-Alt-Referer'];
          if (!xAltReferer) {
            throw new Error('Invalid Input, request must include a X-Alt-Referer header');
          }
          const getUUID = () => {
            const index = xAltReferer.lastIndexOf('?txid=');
            return xAltReferer.substring(index + 6);
          };
          const uuid = getUUID();

          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/jquery/stable': {
        POST: ({ requestHeaders, requestBody = {} }) => {
          if (!requestBody.version) {
            throw new Error('Invalid Input, request JSON body must include a version key');
          }
          const uuid = requestBody.version;
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
      '/jquery/latest': {
        POST: ({ requestHeaders, requestBody }) => {
          if (!requestBody.version) {
            throw new Error('Invalid Input, request JSON body must include a version key');
          }
          const uuid = requestBody.version;
          return {
            uuid,
            ...mapRequestHeadersToInputs({ requestHeaders }),
          };
        },
      },
    },
  };

  const mapRequestMappingToHost = {
    'test.cdnjs.io': requests.cdnjs,
    'cloudflare.cdnjs.io': requests.cdnjs,
    'github-cdn.com': requests.githubcdn,
  };

  return mapRequestMappingToHost[requestHost];
};

export default ValidateRequestInputs;
