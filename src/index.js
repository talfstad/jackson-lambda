import logger from 'npmlog';
import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../lib/jackson-core';
import { logLevel as configLogLevel } from '../config';

exports.handler = (event, context, callback) => {
  logger.silly(JSON.stringify(event));

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
      new JacksonCore({ stageVariables }).processRequest(requestParams))
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
};
