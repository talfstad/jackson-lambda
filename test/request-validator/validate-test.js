import {
    expect,
} from 'chai';
import requestValidator from '../../lib/request-validator/index';

describe('Request Validator -> validate()', () => {
  const requestHost = 'test.cdnjs.io';
  const requestMethod = 'GET';
  const requestPath = '/jquery/dist';

  it('fails if no requestHost', () => {
    requestValidator.validate({
      requestMethod,
      requestPath,
    })
      .catch((err) => {
        expect(err).to.not.equal(null);
      });
  });

  it('fails if no requestPath', () => {
    requestValidator.validate({
      requestMethod,
      requestHost,
    })
      .catch((err) => {
        expect(err).to.not.equal(null);
      });
  });
});
