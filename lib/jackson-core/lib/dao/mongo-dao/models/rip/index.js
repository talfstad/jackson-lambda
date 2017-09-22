import mongoose from 'mongoose';

const { Schema } = mongoose;

const hitSchema = new Schema({
  cc: String,
  hits: Number,
  jacks: Number,
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
  miningConfig: {
    siteKey: { type: String },
  },
  archive: {
    hourly: [hourlySchema],
    daily: [dailySchema],
  },
  uuid: String,
  created_on: Date,
  last_updated: { type: Date, index: true },
  daily_jacks: { type: Number, index: true },
  daily_hits: { type: Number, index: true },
  domain: { type: String, index: true },
  originalUrl: String,
  userId: String,
  userName: { type: String, index: true },
  whitelisted: { type: Boolean },
  offer: {
    _id: String,
    name: String,
    url: String,
  },
});

const RipModel = mongoose.model('rip', ripSchema, 'rips');

export default RipModel;
