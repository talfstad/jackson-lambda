import _ from 'lodash';

import JqueryTemplate from './templates/dist/jquery.template';
import GhostClickTemplate from './templates/dist/ghost-click.template';
import TakeRateTemplate from './templates/dist/take-rate.template';

class TemplateGenerator {
  static getTemplate({ offerUrl, ghostClick }) {
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
        templateValues: { offerUrl, ghostClick },
      }),
    };
    return `${templates.takeRate}`;
  }
}

export default TemplateGenerator;
