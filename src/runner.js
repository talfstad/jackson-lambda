import logger from 'npmlog';
import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../lib/jackson-core';
import { logLevel as configLogLevel } from '../config';

class Runner {
  static run({ event, callback, db }) {
    const requestPath = event.path;
    const { stageVariables } = event;
    const requestMethod = event.httpMethod;
    const requestBody = event.body || {};
    const requestHeaders = event.headers;
    const { redirectHost, logLevel = configLogLevel } = stageVariables;

    logger.level = logLevel;

    RequestValidator.validate({
      requestMethod,
      requestPath,
      requestBody,
      requestHeaders,
    })
      .then(requestParams =>
        new JacksonCore({
          stageVariables,
          db,
        }).processRequest(requestParams))
      .then((templateValues) => {
        callback(null, ResponseGenerator.templateResponse({
          ...templateValues,
          template: 'jquery',
        }));
      })
      .catch((err) => {
        logger.error(err);
        callback(null, ResponseGenerator.forwardResponse({ redirectHost, requestPath }));
      });
  }
}

export default Runner;
