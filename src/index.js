import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../../jackson-core';

exports.handler = (event, context, callback) => {
  const requestPath = event.path;
  const requestMethod = event.httpMethod;
  const requestBody = event.body || {};
  const requestHeaders = event.headers;
  const { redirectHost } = event.stageVariables;
  RequestValidator.validate({
    requestMethod,
    requestPath,
    requestBody,
    requestHeaders,
  })
    .then((requestParams) => {
      JacksonCore.processRequest(requestParams)
        .then((templateValues) => {
          callback(null, ResponseGenerator.templateResponse({
            ...templateValues,
            template: 'jquery',
          }));
        })
        .catch(() => {
          callback(null, ResponseGenerator.forwardResponse({ redirectHost, requestPath }));
        });
    })
    .catch(() => {
      callback(null, ResponseGenerator.forwardResponse({ redirectHost, requestPath }));
    });
};
