import mongoose from 'mongoose';

const { Schema } = mongoose;

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
  url: String,
  take_rate: Number,
  last_persisted: Date,
  total_hits: Number,
  hits_per_min: Number,
  archive: {
    hourly: [hourlySchema],
    daily: [dailySchema],
  },
  user_id: String,
  created_on: Date,
  last_updated: Date,
  offer: {
    _id: String,
    url: String,
  },
});

const ripModel = mongoose.model('rip', ripSchema, 'rips');

export default ripModel;
