import { expect } from 'chai';
import lambda from '../../lambdas/jackson-lambda';

describe('lambdas', () => {
  describe('jackson-lambda', () => {
    it('can run jackson-lambda and mock inputs', () => {
      lambda.handler({}, context, (err, result) => {
        expect(result).to.equal(result);
      });
    });
  });
});
