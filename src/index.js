import Runner from './runner';
import Config from '../lib/jackson-core/config';
import Dao from '../lib/jackson-core/lib/dao';
// Create db connection variables here. Pass them into the dao. If the dao isn't
// connected, it will connect.
let db = null;

exports.handler = (event, context, callback) => {
  // Necessary to allow lambda to return w/o closing db connection
  context.callbackWaitsForEmptyEventLoop = false;

  const { stageVariables } = event;
  const config = Config({ stageVariables });

  if (!db) {
    db = new Dao({ config });
  }

  Runner.run({ event, context, callback, db });
};
