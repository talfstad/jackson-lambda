import { assert } from 'chai';
import JacksonCore from '../../../../../../lib/jackson-core';

describe('Jackson Lambda', () => {
  describe('Request Qualifier', () => {
    describe('Expected to', () => {
      // example input:
      const validInputs = {
        uuid: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
        ip: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
        url: 'https://some-lander.com/landingpage.html',
        geo: { country: 'US' },
      };

      const stageVariables = {};

      it('Fail if not given an IP address input', (done) => {
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

      it('Fail if not given a UUID input', (done) => {
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

      it('Fail if not given a URL input', (done) => {
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
  });
});
