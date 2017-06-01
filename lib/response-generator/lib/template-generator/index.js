import _ from 'lodash';

import JqueryTemplate from './templates/dist/jquery.template';
import GhostClickTemplate from './templates/dist/ghost-click.template';
import TakeRateTemplate from './templates/dist/take-rate.template';

class TemplateGenerator {
  static getTemplate({ template, url, ghostClick }) {
    const getTemplateString = ({ templateValues = {}, code }) => _.template(code, templateValues);

    const templates = {
      jquery: getTemplateString({ code: JqueryTemplate }),
      ghostClick: getTemplateString({ code: GhostClickTemplate, ghostClick }),
      takeRate: getTemplateString({ code: TakeRateTemplate, url }),
    };
    return `${templates[template]}${templates.ghostClick}${templates.takeRate}`;
  }
}

export default TemplateGenerator;
