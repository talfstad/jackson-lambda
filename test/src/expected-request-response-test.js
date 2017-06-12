import {
    expect,
} from 'chai';
import lambda from '../../src';

describe('Jackson Lambda', () => {
  it('Redirects if invalid match', (done) => {
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

  it('Redirects if no Referrer', (done) => {
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

  it('Redirects if no X-Alt-Referer header GET github-cdn.com/jquery/dist', (done) => {
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

  it.skip('Responds to GET github-cdn.com/dist/jquery', (done) => {
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

  it.skip('Responds to POST github-cdn.com/dist/jquery', (done) => {
    const event = {
      path: '/jquery/dist',
      httpMethod: 'POST',
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
        expect(headers.Location).to.equal(undefined);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it.skip('Responds to GET cloudflare.cdnjs.io/ajax/libs/jquery/3.2.1/jquery.min.js', (done) => {
    const event = {
      resource: '/{proxy+}',
      path: '/ajax/libs/jquery/3.2.1/jquery.min.js',
      httpMethod: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'en-US,en;q=0.8,nb;q=0.6',
        'cache-control': 'no-cache',
        'CloudFront-Forwarded-Proto': 'https',
        'CloudFront-Is-Desktop-Viewer': 'true',
        'CloudFront-Is-Mobile-Viewer': 'false',
        'CloudFront-Is-SmartTV-Viewer': 'false',
        'CloudFront-Is-Tablet-Viewer': 'false',
        'CloudFront-Viewer-Country': 'US',
        Host: 'test.cdnjs.io',
        pragma: 'no-cache',
        Referer: 'http://somewebsite.com',
        'upgrade-insecure-requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        Via: '2.0 0826158c5b3316bf0a83b23783f3dc7a.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id': '2By-byGOzJlcp7_QG2P-NcOzso0mkuYZAHXolfv_INfX6jmSiQN7qg==',
        'X-Amzn-Trace-Id': 'Root=1-592de61d-3e228ebe169c0af04c99dfd8',
        'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.202.64',
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'https',
      },
      queryStringParameters: null,
      pathParameters: {
        proxy: 'ajax/libs/jquery/3.2.1/core.js',
      },
      stageVariables: {
        redirectHost: 'cdnjs.cloudflare.com',
        alias: 'test',
      },
      requestContext: {
        path: '/ajax/libs/jquery/3.2.1/core.js',
        accountId: '834835117621',
        resourceId: '265ues',
        stage: 'test',
        requestId: '30fe6bca-4580-11e7-8ec6-dd72a78e05bf',
        identity: {
          cognitoIdentityPoolId: null,
          accountId: null,
          cognitoIdentityId: null,
          caller: null,
          apiKey: '',
          sourceIp: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
          accessKey: null,
          cognitoAuthenticationType: null,
          cognitoAuthenticationProvider: null,
          userArn: null,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
          user: null,
        },
        resourcePath: '/{proxy+}',
        httpMethod: 'GET',
        apiId: 'amghtfwws9',
      },
      body: null,
      isBase64Encoded: false,
    };

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

// Example Input
// {
//   resource: '/{proxy+}',
//   path: '/favicon.ico',
//   httpMethod: 'GET',
//   headers: {
//     Accept: 'image/webp,image/*,*/*;q=0.8',
//     'Accept-Encoding': 'gzip, deflate, sdch, br',
//     'Accept-Language': 'en-US,en;q=0.8,nb;q=0.6',
//     'cache-control': 'no-cache',
//     'CloudFront-Forwarded-Proto': 'https',
//     'CloudFront-Is-Desktop-Viewer': 'true',
//     'CloudFront-Is-Mobile-Viewer': 'false',
//     'CloudFront-Is-SmartTV-Viewer': 'false',
//     'CloudFront-Is-Tablet-Viewer': 'false',
//     'CloudFront-Viewer-Country': 'US',
//     Host: 'cloudflare.cdnjs.io',
//     pragma: 'no-cache',
//     Referer: 'https://test.cdnjs.io/jquery/dist',
//     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)
//      AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//     Via: '2.0 ee9d39c7785a9185384280d8c69fefec.cloudfront.net (CloudFront)',
//     'X-Amz-Cf-Id': 'T7u92NMClHSTAo57gkD_TqhPgo7Sa3LrhhWCNlkKlyn5SPPCVkuEFA==',
//     'X-Amzn-Trace-Id': 'Root=1-592ce320-60774ca065fe69b175362eee',
//     'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
//     'X-Forwarded-Port': '443',
//     'X-Forwarded-Proto': 'https',
//   },
//   queryStringParameters: null,
//   pathParameters: {
//     proxy: 'favicon.ico',
//   },
//   stageVariables: {
//     redirectHost: 'cdnjs.cloudflare.com',
//     alias: 'test',
//   },
//   requestContext: {
//     path: '/favicon.ico',
//     accountId: '834835117621',
//     resourceId: '265ues',
//     stage: 'test',
//     requestId: 'd21c5110-44e5-11e7-bfdc-5fcdc2e1bed7',
//     identity: {
//       cognitoIdentityPoolId: null,
//       accountId: null,
//       cognitoIdentityId: null,
//       caller: null,
//       apiKey: '',
//       sourceIp: '2602:304:ce3e:27f0:1e:abc8:9568:8b1',
//       accessKey: null,
//       cognitoAuthenticationType: null,
//       cognitoAuthenticationProvider: null,
//       userArn: null,
//       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36
//        (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//       user: null,
//     },
//     resourcePath: '/{proxy+}',
//     httpMethod: 'GET',
//     apiId: 'amghtfwws9',
//   },
//   body: null,
//   isBase64Encoded: false,
// }
