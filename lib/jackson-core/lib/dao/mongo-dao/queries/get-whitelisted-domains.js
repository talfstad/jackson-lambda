import WhitelistedDomain from '../models/whitelisted-domain';

export default () => new Promise((resolve, reject) => {
  WhitelistedDomain.find({})
    .then((domains) => {
      resolve(domains);
    })
    .catch(err => reject(err));
});
