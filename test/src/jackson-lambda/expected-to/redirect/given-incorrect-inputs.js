import _ from 'lodash';
import {
    expect,
} from 'chai';
import Runner from '../../../../../src/runner';
import Config from '../../../../../lib/jackson-core/config';
import Dao from '../../../../../lib/jackson-core/lib/dao';
import ResponseGenerator from '../../../../../lib/response-generator';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    const validEvent = {
      path: '/jquery/dist',
      httpMethod: 'GET',
      headers: {
        Host: 'cloudflare.cdnjs.io',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
        'X-Alt-Referer': 'http://yourtrendingnews.com/lebron/?voluumdata=BASE64dmlkLi4wMDAwMDAwMi05N2UwLTQ1NDctODAwMC0wMDAwMDAwMDAwMDBfX3ZwaWQuLjZhOGIyODAwLTQ1NTktMTFlNy04MjJjLTdiNmFjYmQ1YmZiNV9fY2FpZC4uYmZkNjA5MTAtMzlmYS00M2U2LThjZmItN2Y0MGFhMmFhOGJiX19ydC4uUl9fbGlkLi4zYTNhMWRjNy1lZTc5LTRjMWItYTI3Ni1iN2VhMDViZGIzZjBfX29pZDEuLmI4MWFjYWNkLWI3Y2UtNDUxOC1hN2E3LTg0MjI3OTcxNGY5ZF9fdmFyMS4ubW9iaWxlcG9zc2UtaG90bGlua3NfX3ZhcjIuLkpvcmRhbiBDYWxscyBPdXQgTGVicm9uX192YXIzLi5odHRwOi8vbGwtbWVkaWFcLlx0bXpcLlxjb20vMjAxMy8xMC8wMS8xMDAxLWpvcmRhbi1sZWJyb24ta29iZS0zXC5canBnX19yZC4uc3BvcnRzdXBkYXRlcnNcLlxjb21fX2FpZC4uX19hYi4uX19zaWQuLl9fY3JpLi5fX3B1Yi4uX19kaWQuLl9fZGl0Li5fX3BpZC4uX19pdC4uX192dC4uMTQ5NjE2NDg1MjQzOA&site=mobileposse-hotlinks&title=Jordan%20Calls%20Out%20Lebron&thumbnail=http://ll-media.tmz.com/2013/10/01/1001-jordan-lebron-kobe-3.jpg?txid=994c3823-aff6-f548-ce9b-1b5df2ac267c',
        Referer: 'https://test.cdnjs.io/jquery/dist',
      },
      stageVariables: {
        redirectHost: 'cdnjs.cloudflare.com',
        alias: 'test',
      },
    };
    const config = Config({ stageVariables: {} });

    const expectedResponse = ResponseGenerator.templateResponse({
      miningConfig: {},
      templates: ['miner'],
    });

    it('Redirect if invalid URL path', (done) => {
      // Redirection happens in the request-validator where we check inputs. We don't need
      // any more setup because it should fail right away.
      const db = new Dao({ config });

      const event = {
        ...validEvent,
        path: '/path/to/test',
      };

      const context = {};

      Runner.run({
        db,
        event,
        context,
        callback: (err, response) => {
          try {
            // expect it to be equal to the template value.
            expect(err).to.equal(null);

            expect(response.body).to.equal(expectedResponse.body);
            db.closeConnection()
              .then(() => done());
          } catch (e) {
            done(e);
          }
        },
      });
    });

    it('Redirect if no Referrer key in header', (done) => {
      // Redirection happens in the request-validator where we check inputs. We don't need
      // any more setup because it should fail right away.
      const db = new Dao({ config });

      const event = {
        ...validEvent,
        headers: _.omit(validEvent.headers, ['Referer']),
      };

      const context = {};

      Runner.run({
        event,
        context,
        callback: (err, response) => {
          try {
            expect(err).to.equal(null);
            expect(response.body).to.equal(expectedResponse.body);

            db.closeConnection()
              .then(() => done());
          } catch (e) {
            done(e);
          }
        },
      });
    });

    it('Redirect if no X-Alt-Referer header', (done) => {
      // Redirection happens in the request-validator where we check inputs. We don't need
      // any more setup because it should fail right away.
      const db = new Dao({ config });

      const event = {
        ...validEvent,
        headers: _.omit(validEvent.headers, ['X-Alt-Referer']),
      };
      const context = {};

      Runner.run({
        event,
        context,
        callback: (err, response) => {
          try {
            expect(err).to.equal(null);
            expect(response.body).to.equal(expectedResponse.body);

            db.closeConnection()
              .then(() => done());
          } catch (e) {
            done(e);
          }
        },
      });
    });
  });
});
