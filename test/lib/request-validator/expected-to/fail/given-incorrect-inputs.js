import {
    expect,
} from 'chai';
import requestValidator from '../../../../../lib/request-validator';

describe('Jackson Lambda', () => {
  describe('Request Validator', () => {
    describe('Expected to', () => {
      const requestHost = 'test.cdnjs.io';
      const requestMethod = 'GET';
      const requestPath = '/jquery/dist';

      it('Fail when not given a requestHost input', (done) => {
        requestValidator.validate({
          requestMethod,
          requestPath,
        })
        .then(() => done())
        .catch((err) => {
          expect(err).to.not.equal(null);
          done();
        });
      });

      it('Fail when not given a requestPath input', (done) => {
        requestValidator.validate({
          requestMethod,
          requestHost,
        })
        .then(() => done())
        .catch((err) => {
          expect(err).to.not.equal(null);
          done();
        });
      });
    });
  });
});
