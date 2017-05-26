exports.handler = (event, context, callback) => {
  callback(null, { hi: 'this is ci 2' });  // Echo back the first key value
};
