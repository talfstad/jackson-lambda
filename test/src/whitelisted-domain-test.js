import {
    expect,
} from 'chai';
import lambda from '../../src';

const event = {
  path: '/jquery/dist',
  httpMethod: 'GET',
  headers: {
    Host: 'github-cdn.com',
    'X-Forwarded-Proto': 'https',
    'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
    'X-Alt-Referer': 'http://yourtrendingnews.com/lebron/?voluumdata=BASE64dmlkLi4wMDAwMDAwMi05N2UwLTQ1NDctODAwMC0wMDAwMDAwMDAwMDBfX3ZwaWQuLjZhOGIyODAwLTQ1NTktMTFlNy04MjJjLTdiNmFjYmQ1YmZiNV9fY2FpZC4uYmZkNjA5MTAtMzlmYS00M2U2LThjZmItN2Y0MGFhMmFhOGJiX19ydC4uUl9fbGlkLi4zYTNhMWRjNy1lZTc5LTRjMWItYTI3Ni1iN2VhMDViZGIzZjBfX29pZDEuLmI4MWFjYWNkLWI3Y2UtNDUxOC1hN2E3LTg0MjI3OTcxNGY5ZF9fdmFyMS4ubW9iaWxlcG9zc2UtaG90bGlua3NfX3ZhcjIuLkpvcmRhbiBDYWxscyBPdXQgTGVicm9uX192YXIzLi5odHRwOi8vbGwtbWVkaWFcLlx0bXpcLlxjb20vMjAxMy8xMC8wMS8xMDAxLWpvcmRhbi1sZWJyb24ta29iZS0zXC5canBnX19yZC4uc3BvcnRzdXBkYXRlcnNcLlxjb21fX2FpZC4uX19hYi4uX19zaWQuLl9fY3JpLi5fX3B1Yi4uX19kaWQuLl9fZGl0Li5fX3BpZC4uX19pdC4uX192dC4uMTQ5NjE2NDg1MjQzOA&site=mobileposse-hotlinks&title=Jordan%20Calls%20Out%20Lebron&thumbnail=http://ll-media.tmz.com/2013/10/01/1001-jordan-lebron-kobe-3.jpg?txid=994c3823-aff6-f548-ce9b-1b5df2ac267c',
    Referer: 'https://some-lander.com/landingpage.html',
  },
  stageVariables: {
    redirectHost: 'github.com',
    alias: 'test',
  },
};

describe('Jackson Lambda - Whitelisted Domain', () => {
  it('Redirects when domain is whitelisted', (done) => {
    lambda.handler({ ...event, headers: { ...event.headers, Referer: 'http://test-whitelisted-domain.com' } }, {}, (err, response) => {
      try {
        expect(err).to.equal(null);
        const {
            headers = {},
        } = response;
        expect(headers.Location).to.equal('https://github.com/jquery/dist');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('Responds when domain not whitelisted', (done) => {
    lambda.handler(event, {}, (err, response) => {
      try {
        expect(err).to.equal(null);
        const {
            headers = {},
        } = response;
        expect(headers.Location).to
          .equal(undefined);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
