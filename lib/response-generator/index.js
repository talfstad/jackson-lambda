import path from 'path';
import TemplateGenerator from './lib/template-generator';

class RequestGenerator {
  static forwardResponse({ redirectHost, requestPath }) {
    return {
      statusCode: 200,
      headers: {
        // Location: `https://${path.join(redirectHost, requestPath)}`,
        'Content-Type': 'text/javascript',
        'Access-Control-Request-Method': 'POST,GET',
        'Access-Control-Request-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-alt-referer',
        'Access-Control-Allow-Origin': '*',
        body: 'var a = 10;',
      },
    };
  }

  static templateResponse(inputs) {
    return {
      headers: {
        'Content-Type': 'text/javascript',
        'Access-Control-Allow-Origin': '*',
      },
      body: TemplateGenerator.getTemplate(inputs),
      statusCode: 200,
    };
  }
}

export default RequestGenerator;
