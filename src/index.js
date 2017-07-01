import logger from 'npmlog';

// create mongoose connection in handler right here.
// mongo doesnt create connection at all
import mongoose from 'mongoose';

import RequestValidator from '../lib/request-validator';
import ResponseGenerator from '../lib/response-generator';
import JacksonCore from '../lib/jackson-core';
import { logLevel as configLogLevel } from '../config';

exports.handler = (event, context, callback) => {
  // Necessary to allow lambda to return w/o closing db connection
  context.callbackWaitsForEmptyEventLoop = false;

  // Need to create a mongoose connection?
  // mongoose.connection.readyState will equal 1 if connected. else create
  if (mongoose.connection.readyState < 1) {
    logger.silly('MONGOOSE: mongoose has no connection');
    // Create connection
  }

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
