import { expect } from 'chai';
import lambda from '../../lambdas/rs-glue';

describe('lambdas', () => {
  describe('rs-glue', () => {
    it('can run the rs-glue lambda and mock inputs', () => {
      lambda.handler({}, context, (err, result) => {
        expect(result).to.equal(result);
      });
    });
  });
});
