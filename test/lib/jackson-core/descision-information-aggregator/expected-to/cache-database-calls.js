describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('Decision Information Aggregator', () => {
      describe('Expected to', () => {
        it('Cache rip records from mongo in redis', (done) => {
          // 1. clear db of rip we are going to test
          // 2. clear redis of rip we are going to test
          // 3. write record to mongo to test
          // 3. run decision aggregator
          // 4. expect it to be in redis now
          // 5. delete rip record from mongo
          // 6. delete rip record from redis
          done();
        });

        it('Cache user configuration from mongo in redis', (done) => {
          // 1. clear db of userConfig we are going to test
          // 2. clear redis of userConfig we are going to test
          // 3. write user record to mongo to test with config subdocument
          // 3. run decision aggregator
          // 4. expect config to be in redis now
          // 5. delete test user record from mongo
          // 6. delete test userConfig record from redis
          done();
        });
      });
    });
  });
});
