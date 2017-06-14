import mongoose from 'mongoose';

const { Schema } = mongoose;

const ripSchema = new Schema({
  url: String,
  user_id: String,
  created_on: Date,
  last_updated: Date,
});

const ripModel = mongoose.model('rip', ripSchema, 'rips');

export default ripModel;
