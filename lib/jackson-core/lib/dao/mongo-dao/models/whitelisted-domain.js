import mongoose from 'mongoose';

const { Schema } = mongoose;

const whitelistedDomainSchema = new Schema({
  name: String,
  user_id: String,
  created_on: Date,
});

const WhitelistedDomainModel = mongoose.model('whitelisted_domain', whitelistedDomainSchema, 'whitelisted_domains');

export default WhitelistedDomainModel;
