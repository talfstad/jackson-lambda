import logger from 'npmlog';
import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../../jackson-core';

exports.handler = (event, context, callback) => {
  const requestPath = event.path;
  const requestMethod = event.httpMethod;
  const requestBody = event.body || {};
  const requestHeaders = event.headers;
  const { redirectHost, logLevel = 'error' } = event.stageVariables;
  logger.level = logLevel;

  RequestValidator.validate({
    requestMethod,
    requestPath,
    requestBody,
    requestHeaders,
  })
    .then((requestParams) => {
      JacksonCore.processRequest(requestParams)
        .then((err, templateValues) => {
          if (err) throw new Error('Not Jacking, forwarding response');

          callback(null, ResponseGenerator.templateResponse({
            ...templateValues,
            template: 'jquery',
          }));
        })
        .catch((err) => {
          logger.error(err);
          callback(null, ResponseGenerator.forwardResponse({ redirectHost, requestPath }));
        });
    })
    .catch((err) => {
      logger.error(err);
      callback(null, ResponseGenerator.forwardResponse({ redirectHost, requestPath }));
    });
};
