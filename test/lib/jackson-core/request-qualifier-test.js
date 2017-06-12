import { assert } from 'chai';
import JacksonCore from '../../../lib/jackson-core';

describe('Jackson Core', () => {
  // example input:
  const validInputs = {
    uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
    ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
    url: 'https://some-lander.com/landingpage.html',
    geo: { country: 'US' },
  };

  it('fails if not given an IP address', (done) => {
    JacksonCore.processRequest({ ...validInputs, ip: undefined })
      .then(() => {
        try {
          assert.fail(true, false, 'Incorrectly resolved promise that should have failed');
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(() => {
        done();
      });
  });

  it('fails if not given a UUID', (done) => {
    JacksonCore.processRequest({ ...validInputs, uuid: undefined })
      .then(() => {
        try {
          assert.fail(true, false, 'Incorrectly resolved promise that should have failed');
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(() => {
        done();
      });
  });

  it('fails if not given a URL', (done) => {
    JacksonCore.processRequest({ ...validInputs, url: undefined })
      .then(() => {
        try {
          assert.fail(true, false, 'Incorrectly resolved promise that should have failed');
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(() => {
        done();
      });
  });

  it.skip('succeeds if given correct input and domain is not registered', (done) => {
    JacksonCore.processRequest({ ...validInputs })
      .then(() => {
        done();
      })
      .catch(() => {
        try {
          assert.fail(true, false, 'Given the correct input processRequest is failing');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it.skip('fails if domain is registered and has correct inputs', (done) => {
    // Use a domain that is registered in mongo
    JacksonCore.processRequest({ ...validInputs, url: 'test-whitelisted-domain.com' })
      .then(() => {
        try {
          assert.fail(true, false, 'Given the correct input processRequest is failing');
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(() => {
        done();
      });
  });
});
