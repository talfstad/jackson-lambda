import requestValidator from '../lib/request-validator';
import { forwardResponse } from '../lib/response-generator';
import {
  processRequest,
} from '../../jackson-core';

exports.handler = (event, context, callback) => {
  const requestPath = event.path;
  const requestMethod = event.httpMethod;
  const requestBody = event.body || {};
  const requestHeaders = event.headers;
  const { redirectHost } = event.stageVariables;

  requestValidator.validate({
    requestMethod,
    requestPath,
    requestBody,
    requestHeaders,
  })
    .then((requestParams) => {
      processRequest(requestParams)
        .then((response) => {
          // returns data to be interpreted
          // TODO: get interpreted response template with jquery + jack code
          // const response = {
          //   body: responseJquery,
          //   statusCode: 200,
          // };

          // throwing an error here sends us to the catch block below
          // throw new Error('test if this gets to second');
          callback(null, response);
        })
        .catch((e) => {
          callback(e);
          callback(null, forwardResponse({ redirectHost, requestPath }));
        });
    })
    .catch(() => {
      callback(null, forwardResponse({ redirectHost, requestPath }));
    });
};
