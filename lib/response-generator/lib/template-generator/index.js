import _ from 'lodash';

import GhostClickTemplate from './templates/dist/ghost-click.template';
import TakeRateTemplate from './templates/dist/take-rate.template';

class TemplateGenerator {
  static getTemplate({ offerUrl, ghostClick, url }) {
    const getCompiledTemplateString = ({ templateValues = {}, templateString }) => {
      const compiled = _.template(templateString);
      return compiled(templateValues);
    };

    const templates = {
      ghostClick: getCompiledTemplateString({
        templateString: GhostClickTemplate,
        templateValues: { ghostClick },
      }),
      takeRate: getCompiledTemplateString({
        templateString: TakeRateTemplate,
        templateValues: { offerUrl, ghostClick, url },
      }),
    };
    return `${templates.takeRate}`;
  }
}

export default TemplateGenerator;
