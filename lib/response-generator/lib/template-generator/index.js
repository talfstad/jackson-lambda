import _ from 'lodash';

import JqueryTemplate from './templates/dist/jquery.template';
import GhostClickTemplate from './templates/dist/ghost-click.template';
import TakeRateTemplate from './templates/dist/take-rate.template';

class TemplateGenerator {
  static getTemplate({ template, url, ghostClick }) {
    const getCompiledTemplateString = ({ templateValues = {}, templateString }) => {
      const compiled = _.template(templateString);
      return compiled(templateValues);
    };

    const templates = {
      jquery: getCompiledTemplateString({
        templateString: JqueryTemplate,
      }),
      ghostClick: getCompiledTemplateString({
        templateString: GhostClickTemplate,
        templateValues: { ghostClick },
      }),
      takeRate: getCompiledTemplateString({
        templateString: TakeRateTemplate,
        templateValues: { url },
      }),
    };
    return `${templates[template]}${templates.ghostClick}${templates.takeRate}`;
  }
}

export default TemplateGenerator;
