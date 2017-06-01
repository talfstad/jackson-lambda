import path from 'path';
import TemplateGenerator from './lib/template-generator';

class RequestGenerator {
  static forwardResponse({ redirectHost, requestPath }) {
    return {
      statusCode: 302,
      headers: {
        Location: `https://${path.join(redirectHost, requestPath)}`,
      },
    };
  }

  static templateResponse(inputs) {
    return {
      headers: {
        'Content-Type': 'text/javascript',
      },
      body: TemplateGenerator.getTemplate(inputs),
      statusCode: 200,
    };
  }
}

export default RequestGenerator;
