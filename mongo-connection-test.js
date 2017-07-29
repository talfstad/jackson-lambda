const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema;

const hitSchema = new Schema({
  cc: String,
  hits: Number,
});

const hourlySchema = new Schema({
  hour: Number,
  hits: [hitSchema],
});

const dailySchema = new Schema({
  date: Date,
  hourly: [hourlySchema],
});

const ripSchema = new Schema({
  url: { type: String, index: true },
  take_rate: { type: Number, index: true },
  total_hits: { type: Number, index: true },
  hits_per_min: Number,
  consecutive_min_traffic: Number,
  archive: {
    hourly: [hourlySchema],
    daily: [dailySchema],
  },
  uuid: String,
  created_on: Date,
  last_updated: { type: Date, index: true },
  daily_jacks: { type: Number, index: true },
  daily_hits: Number,
  userId: String,
  userName: { type: String, index: true },
  offer: {
    _id: String,
    url: String,
  },
});

const configSchema = new Schema({
  last_updated: Date,
  min_minutes_consecutive_traffic: Number,
  min_daily_hits_to_take: Number,
  min_hits_per_min_to_take: Number,
});

const uuidSchema = new Schema({
  uuid: String,
});

const userSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  uuids: [uuidSchema],
  config: configSchema,
  created_on: Date,
  last_updated: Date,
});

const User = mongoose.model('user', userSchema, 'users');

const Rip = mongoose.model('rip', ripSchema, 'rips');

mongoose.connect('mongodb://jackson:Wewillrockyou1986!@ds153761-a0.mlab.com:53761,ds153761-a1.mlab.com:53761/test?replicaSet=rs-ds153761', {
  server: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000,
    },
  },
  replset: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000,
    },
  },
})
.then(() => {
  const bulk = Rip.collection.initializeOrderedBulkOp();

  const prepRip = (rip) => {
    const uuid = rip.uuid;

    return new Promise((resolve) => {
      // find the user that owns this rip.
      User.findOne({ 'uuids.uuid': uuid })
      .then((user) => {
        const userId = user._id;
        const userName = user.name;

        // update the rip
        bulk.find({
          _id: rip._id,
        }).update({
          $set: {
            userId,
            userName,
          },
        });
        resolve();
      });
    });
  };

  // query all rips without userName.
  Rip.find({ userName: { $exists: false } })
  .then((rips) => {
    _.each(rips, (rip, idx) => {
      console.log(rips.length - 1);
      console.log(idx);
      // for each rip query who owns it (if no userName)
      prepRip(rip)
        .then(() => {
          if (rips.length - 1 === idx) {
            bulk.execute((err) => {
              if (err) console.log(err);
              else console.log('successfully did it...');
            });
          }
        });
    });
  })
  .catch((err) => {
    console.log(err);
  });
});
