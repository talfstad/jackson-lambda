exports.validate = ({
  requestMethod,
  requestHost,
  requestPath,
}) => {
  const promise = new Promise((resolve, reject) => {
    if (!requestMethod || !requestHost || !requestPath) {
      throw new Error('Invalid Input Params');
    }
    reject();
  });
  return promise;
};
