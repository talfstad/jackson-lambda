import {
    expect,
} from 'chai';
import lambda from '../../src/index';

describe('Jackson Lambda -> index.js', () => {
  const event = {
    message: 'Hello World!',
    input: {
      resource: '/{proxy+}',
      path: '/jquery/dist',
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
        'upgrade-insecure-requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        Via: '2.0 5f130ce838179749514a2167125b9248.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Id': 'mN2O1-pG4aD61Cyf6DWsssWByWLuoUIFteqhB3qBHCpr0VWxbxArZQ==',
        'X-Amzn-Trace-Id': 'Root=1-592c625b-1985f809706cc2b65ae7f470',
        'X-Forwarded-For': '76.227.226.127, 205.251.202.194',
        'X-Forwarded-Port': '443',
        'X-Forwarded-Proto': 'https',
      },
      queryStringParameters: null,
      pathParameters: {
        proxy: 'jquery/dist',
      },
      stageVariables: {
        alias: 'test',
      },
      requestContext: {
        path: '/jquery/dist',
        accountId: '834835117621',
        resourceId: '265ues',
        stage: 'test',
        requestId: '11ec18f2-4499-11e7-a446-4f7f136f3e3a',
        identity: {
          cognitoIdentityPoolId: null,
          accountId: null,
          cognitoIdentityId: null,
          caller: null,
          apiKey: '',
          sourceIp: '76.227.226.127',
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
    },
  };

  it('Rejects correct Method wrong path', () => {
    lambda.handler(event, {}, (err, response) => {
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
