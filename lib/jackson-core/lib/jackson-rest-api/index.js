import logger from 'npmlog';
import { logLevel } from '../../../../config';

logger.level = logLevel;

class JacksonCoreRestApi {
  constructor({ db }) {
    if (!db) throw new Error('DecisionEngine requires a DAO instance on construction');
    this.db = db;
  }

  // Just ensures that the /api/ tag is in the URL.
  // This will trigger this library to handle the request,
  // otherwise it will pass on the request to be handled elsewhere
  static validate({
    requestPath,
  }) {
    return new Promise((resolve, reject) => {
      if (/^\/api\//.test(requestPath)) {
        resolve();
      } else {
        reject();
      }
    });
  }

  processRequest({
    // requestMethod,
    // requestPath,
    requestBody,
    // requestHeaders,
  }) {
    const response = responseJSON => ({
      headers: {
        'Content-Type': 'text/javascript',
      },
      body: responseJSON,
      statusCode: 200,
    });

    const error = responseJSON => ({
      headers: {
        'Content-Type': 'text/javascript',
      },
      body: responseJSON,
      statusCode: 400,
    });

    return new Promise((resolve) => {
      // Whitelist the domain
      const { domain } = requestBody;

      const mongoDao = this.db.getMongoDao();

      const removeProtocol = domainToChange =>
        domainToChange.replace(/http(s?):\/\//, '');

      mongoDao.whitelistDomain(removeProtocol(domain))
        .then(() => {
          resolve(response({ msg: `${domain} has successfully been whitelisted.` }));
        })
        .catch(() => {
          resolve(error({ msg: `${domain} could not be whitelisted.` }));
        });
    });
  }
}

export default JacksonCoreRestApi;
