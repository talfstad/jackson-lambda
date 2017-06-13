import logger from 'npmlog';
import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../lib/jackson-core';

exports.handler = (event, context, callback) => {
  const requestPath = event.path;
  const { stageVariables } = event;
  const requestMethod = event.httpMethod;
  const requestBody = event.body || {};
  const requestHeaders = event.headers;
  const { redirectHost, logLevel = 'error' } = stageVariables;
  logger.level = logLevel;

  RequestValidator.validate({
    requestMethod,
    requestPath,
    requestBody,
    requestHeaders,
  })
    .then((requestParams) => {
      new JacksonCore({ stageVariables }).processRequest(requestParams)
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
