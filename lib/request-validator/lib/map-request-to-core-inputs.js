import geoip from 'geoip-country-lite';

const getCoreInputs = ({ uuid, requestHeaders }) => {
  const ip = (requestHeaders['X-Forwarded-For'] || '').split(',')[0];
  const url = requestHeaders.Referer;
  if (!url) {
    return false; // Error, need URL
  }
  return {
    ip,
    uuid,
    url,
    geo: geoip.lookup(ip),
  };
};

const cdnjsRequests = {
  '/ajax/libs/jquery/3.2.1/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '3.2.1';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/ajax/libs/jquery/3.2.0/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '3.2.0';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/ajax/libs/jquery/3.1.1/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '3.1.1';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/ajax/libs/jquery/3.1.0/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '3.1.0';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/ajax/libs/jquery/3.0.0/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '3.0.0';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/ajax/libs/jquery/2.2.4/jquery.min.js': {
    GET: ({ requestHeaders }) => {
      const uuid = '2.2.4';
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
};

const githubcdnRequests = {
  '/jquery': {
    POST: ({ requestHeaders, requestBody }) => {
      if (!requestBody.version) {
        return false;
      }
      const uuid = requestBody.version;
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/jquery/dist': {
    POST: ({ requestHeaders, requestBody }) => {
      if (!requestBody.version) {
        return false;
      }
      const uuid = requestBody.version;
      return getCoreInputs({ uuid, requestHeaders });
    },
    GET: ({ requestHeaders }) => {
      const xAltReferer = requestHeaders['X-Alt-Referer'];
      if (!xAltReferer) {
        // Error, need xAltReferer
        return false;
      }
      const getUUID = () => {
        const index = xAltReferer.lastIndexOf('?txid=');
        return xAltReferer.substring(index + 6);
      };
      const uuid = getUUID();

      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/jquery/stable': {
    POST: ({ requestHeaders, requestBody = {} }) => {
      if (!requestBody.version) {
        return false;
      }
      const uuid = requestBody.version;
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
  '/jquery/latest': {
    POST: ({ requestHeaders, requestBody }) => {
      if (!requestBody.version) {
        return false;
      }
      const uuid = requestBody.version;
      return getCoreInputs({ uuid, requestHeaders });
    },
  },
};

module.exports = {
  'test.cdnjs.io': cdnjsRequests,
  'cloudflare.cdnjs.io': cdnjsRequests,
  'github-cdn.com': githubcdnRequests,
};
