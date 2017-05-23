exports.handler = function index(event, context, callback) {
  console.log('TREV event:', JSON.stringify(event, null, 2, 'TREVOR'));
  callback(null, event.key1);  // Echo back the first key value
  callback('Something went wrong');
};
