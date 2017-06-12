import {
    expect,
} from 'chai';
import requestValidator from '../../lib/request-validator';

describe('Request Validator', () => {
  const requestHost = 'test.cdnjs.io';
  const requestMethod = 'GET';
  const requestPath = '/jquery/dist';

  it('fails if no requestHost', (done) => {
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

  it('fails if no requestPath', (done) => {
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
