import mongoose from 'mongoose';

const { Schema } = mongoose;

const configSchema = new Schema({
  last_updated: Date,
  min_minutes_consecutive_traffic: Number,
  min_daily_hits_to_take: Number,
  min_traffic_per_min_to_jack: Number,
});

export default configSchema;
