import {
    expect,
} from 'chai';
import lambda from '../../../../../src';

describe('Jackson Lambda', () => {
  describe('Expected to', () => {
    it('Redirect if invalid URL path', (done) => {
      const event = {
        path: '/path/to/test',
        httpMethod: 'GET',
        headers: {
          Host: 'cloudflare.cdnjs.io',
          Referer: 'https://test.cdnjs.io/jquery/dist',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
        },
        stageVariables: {
          redirectHost: 'cdnjs.cloudflare.com',
          alias: 'test',
        },
      };

      lambda.handler(event, {}, (err, response) => {
        try {
          expect(err).to.equal(null);
          expect(response.headers.Location).to.equal('https://cdnjs.cloudflare.com/path/to/test');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('Redirect if no Referrer key in header', (done) => {
      const event = {
        path: '/jquery/dist',
        httpMethod: 'POST',
        headers: {
          Host: 'github-cdn.com',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
        },
        stageVariables: {
          redirectHost: 'github.com',
          alias: 'test',
        },
        body: {
          version: '994c3823-aff6-f548-ce9b-1b5df2ac267c',
        },
      };

      lambda.handler(event, {}, (err, response) => {
        try {
          expect(err).to.equal(null);
          const {
                headers = {},
            } = response;
          expect(headers.Location).to
              .equal('https://github.com/jquery/dist');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('Redirect if no X-Alt-Referer header', (done) => {
      const event = {
        path: '/jquery/dist',
        httpMethod: 'GET',
        headers: {
          Host: 'github-cdn.com',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
          Referer: 'https://some-lander.com/landingpage.html',
        },
        stageVariables: {
          redirectHost: 'github.com',
          alias: 'test',
        },
      };
      lambda.handler(event, {}, (err, response) => {
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
  });
});
