import MongoDao from '../../../../../../lib/jackson-core/lib/dao/mongo-dao/mongodb';
import Config from '../../../../../../lib/jackson-core/config';

describe('Jackson Lambda', () => {
  describe('Jackson Core', () => {
    describe('MongoDB Models', () => {
      describe('Expected to', () => {
        const config = Config({ stageVariables: {} });
        const mongoDao = new MongoDao({ config: config.mongoDaoConfig() });

        // Rip has no URL
        const url = 'herenewsbreaks.com/foxnews/drphil/drphil-embovarx.html?voluumdata=BASE64dmlkLi4wMDAwMDAwNC1jNjc5LTQ0NDItODAwMC0wMDAwMDAwMDAwMDBfX3ZwaWQuLjliN2NhODAwLTVkZjgtMTFlNy04NDY4LTUxYjVmYzYwYjljMl9fY2FpZC4uNzA4ZDRhM2EtZThmMS00YTZlLThlMzQtNmU1YmY3NDA1OTRhX19ydC4uUl9fbGlkLi4wMDVjZDUzNy02NTJmLTRmNGEtYjM3MS02OGU2OWY1NDI0MzlfX29pZDEuLjRhYTYxZDI2LTk3MzgtNDA0YS05MDE4LTU0MDMxODg2NTAwOV9fdmFyMS4uW2FkXV9fdmFyMi4uUGFzdG9yYUFybGVuZU1hcmNhbm9KV19fdmFyMy4uW3RhcmdldF1fX3ZhcjQuLltnZW5kZXJdX192YXI1Li5bY29udmVyc2lvbl1fX3ZhcjYuLkRQX192YXI3Li5bYWdlXV9fdmFyOC4uc2VjcmV0aGlwaG9wXC5cY29tX192YXI5Li5bSW50ZXJlc3RzXV9fdmFyMTAuLltzdWJpZF1fX3JkLi5zZWNyZXRoaXBob3BcLlxjb21fX2FpZC4uX19hYi4uX19zaWQuLl9fY3JpLi5fX3B1Yi4uX19kaWQuLl9fZGl0Li5fX3BpZC4uX19pdC4uX192dC4uMTQ5ODg3MTAyMzcwOQ&ad=[ad]&account=PastoraArleneMarcanoJW&target=[target]&gender=[gender]&conversion=[conversion]&campaign=DP&age=[age]&utm_campaign=secrethiphop.com&Interest=[Interests]&subid=[subid]';

        it.skip('find existing model', (done) => {
          mongoDao.getRip(url)
            .then(() => {
              mongoDao.closeConnection()
                .then(() => done());
            })
            .catch(() => {
              done(new Error('Should not have created new Rip.'));
            });
        });
      });
    });
  });
});
