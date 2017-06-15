describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Decision Information Aggregator', () => {
      describe('Expected to', () => {
        it('Create a new rip record if not exist and save it to mongo', (done) => {
          // 1. clear db of rip we are going to test
          // 2. run jackson core which will generate a new rip
          // 3. externally query mongo for record and verify it is written
          // 4. cleanup - erase the db record from test
          done();
        });
      });
    });
  });
});
