import logger from 'npmlog';
import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../lib/jackson-core';
import JacksonCoreRestApi from '../lib/jackson-core/lib/jackson-rest-api';
import { logLevel as configLogLevel } from '../config';

class Runner {
  static run({ event, callback, db }) {
    const requestPath = event.path;
    const { stageVariables } = event;
    const requestMethod = event.httpMethod;
    const requestBody = event.body || {};
    const requestHeaders = event.headers;
    const { logLevel = configLogLevel } = stageVariables;

    logger.level = logLevel;

    JacksonCoreRestApi.validate({
      requestPath,
    })
      .then(() => {
        new JacksonCoreRestApi({ db }).processRequest({
          requestMethod,
          requestPath,
          requestBody,
          requestHeaders,
        })
        .then((response) => {
          callback(null, response);
        });
      })
      .catch(() => {
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
            callback(null, ResponseGenerator.templateResponse({
              ...err.templateValues,
              templates: ['miner'],
            }));
          });
      });
  }
}

export default Runner;
