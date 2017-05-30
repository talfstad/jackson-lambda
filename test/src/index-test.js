import {
    expect,
} from 'chai';
import lambda from '../../src/index';

describe('Jackson Lambda -> index.js', () => {
  const event = {
    resource: '/{proxy+}',
    path: '/favicon.ico',
    httpMethod: 'GET',
    headers: {
      Accept: 'image/webp,image/*,*/*;q=0.8',
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
      Referer: 'https://test.cdnjs.io/jquery/dist',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      Via: '2.0 ee9d39c7785a9185384280d8c69fefec.cloudfront.net (CloudFront)',
      'X-Amz-Cf-Id': 'T7u92NMClHSTAo57gkD_TqhPgo7Sa3LrhhWCNlkKlyn5SPPCVkuEFA==',
      'X-Amzn-Trace-Id': 'Root=1-592ce320-60774ca065fe69b175362eee',
      'X-Forwarded-For': '2602:304:ce3e:27f0:1e:abc8:9568:8b1, 205.251.214.90',
      'X-Forwarded-Port': '443',
      'X-Forwarded-Proto': 'https',
    },
    queryStringParameters: null,
    pathParameters: {
      proxy: 'favicon.ico',
    },
    stageVariables: {
      redirectHost: 'cdnjs.cloudflare.com',
      alias: 'test',
    },
    requestContext: {
      path: '/favicon.ico',
      accountId: '834835117621',
      resourceId: '265ues',
      stage: 'test',
      requestId: 'd21c5110-44e5-11e7-bfdc-5fcdc2e1bed7',
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

  it('has returns the correct redirect response for API Gateway', () => {});

  it('Rejects correct Method wrong path', () => {
    lambda.handler(event, {}, (err, response) => {
      console.log(response);
      expect(err).to.equal(null);
      expect(response).to.not.equal(null);
    });
  });

  it('Rejects correct path wrong method', () => {
    lambda.handler(event, {}, (err, response) => {
      expect(err).to.equal(null);
      expect(response).to.not.equal(null);
    });
  });

  it('Correctly maps with path to new host for a redirect', () => {
    lambda.handler(event, {}, (err, response) => {
      expect(err).to.equal(null);
      expect(response).to.not.equal(null);
    });
  });
});
