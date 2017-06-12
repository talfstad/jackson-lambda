import mongoose from 'mongoose';

const { Schema } = mongoose;

const whitelistedDomainSchema = new Schema({
  name: String,
  user_id: String,
  created_on: Date,
});

const whitelistedDomainModel = mongoose.model('whitelisted_domain', whitelistedDomainSchema);

export default whitelistedDomainModel;
