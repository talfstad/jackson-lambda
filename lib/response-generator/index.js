import path from 'path';
import TemplateGenerator from './lib/template-generator';
import { mapHostToRedirectRequestPath } from './config';

class RequestGenerator {
  static forwardResponse({ redirectHost }) {
    return {
      statusCode: 302,
      headers: {
        Location: `https://${path.join(redirectHost, mapHostToRedirectRequestPath[redirectHost])}`,
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
