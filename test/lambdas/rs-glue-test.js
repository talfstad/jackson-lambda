import { expect } from 'chai';
import lambda from '../../lambdas/rs-glue';

describe('lambdas', () => {
  describe('rs-glue', () => {
    it('can run the rs-glue lambda and mock inputs', () => {
      const event = {
        key1: 'key1',
      };

      lambda.handler(event, context, (err, result) => {
        expect(result).to.equal('key1');
      });
    });
  });
});
