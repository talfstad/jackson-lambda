exports.handler = (event, context, callback) => {
  const name = 'World';
  const responseCode = 200;

  const responseBody = {
    message: `Hello ${name}!`,
    input: event,
  };
  const response = {
    statusCode: responseCode,
    headers: {
      'x-custom-header': 'my custom header value',
    },
    body: JSON.stringify(responseBody),
  };
  console.log(`response: ${JSON.stringify(response)}`);
  callback(null, response);
};
