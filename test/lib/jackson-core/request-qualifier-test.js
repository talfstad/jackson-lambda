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

  const stageVariables = {};

  it('fails if not given an IP address', (done) => {
    new JacksonCore({ stageVariables }).processRequest({ ...validInputs, ip: undefined })
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
    new JacksonCore({ stageVariables }).processRequest({ ...validInputs, uuid: undefined })
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
    new JacksonCore({ stageVariables }).processRequest({ ...validInputs, url: undefined })
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
});
