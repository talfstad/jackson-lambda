import mongoose from 'mongoose';

const { Schema } = mongoose;

const uuidSchema = new Schema({
  uuid: String,
});

export default uuidSchema;
