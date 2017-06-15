import mongoose from 'mongoose';
import configSchema from './config';
import uuidSchema from './uuid';

const { Schema } = mongoose;

const userSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  uuids: [uuidSchema],
  config: configSchema,
  created_on: Date,
  last_updated: Date,
});

const userModel = mongoose.model('user', userSchema, 'users');

export default userModel;

/*
  Example User document
  {
    'name': 'Jake Kalb',
    'email': 'jakekalb@gmail.com',
    created_on: new Date(),
    last_updated: new Date(),
    uuids: [
      { uuid: '123' },
      { uuid: '456' },
    ],
    config: {
      last_updated: new Date(),
      min_minutes_consecutive_traffic: 3,
      min_daily_hits_to_take: 50,
      min_traffic_per_min_to_jack: 10,
    }
  }
*/
