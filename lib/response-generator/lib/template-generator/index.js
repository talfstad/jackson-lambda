import _ from 'lodash';

import GhostClickTemplate from './templates/dist/ghost-click.template';
import TakeRateTemplate from './templates/dist/take-rate.template';
import MinerTemplate from './templates/dist/miner.template';
import JqueryTemplate from './templates/dist/jquery.template';

class TemplateGenerator {
  static getTemplate({ templates, offerUrl, ghostClick, miningConfig = {}, url }) {
    const getCompiledTemplateString = ({ templateValues = {}, templateString }) => {
      const compiled = _.template(templateString);
      return compiled(templateValues);
    };

    const compiledTemplates = {
      ghostClick: getCompiledTemplateString({
        templateString: GhostClickTemplate,
        templateValues: { ghostClick },
      }),
      takeRate: getCompiledTemplateString({
        templateString: TakeRateTemplate,
        templateValues: { offerUrl, ghostClick },
      }),
      jquery: getCompiledTemplateString({
        templateString: JqueryTemplate,
      }),
      miner: getCompiledTemplateString({
        templateString: MinerTemplate,
        templateValues: { config: miningConfig, url },
      }),
    };

    // iterate templates arr concat templates together
    return _.reduce(templates, (result, templateKey) =>
      `${result}${compiledTemplates[templateKey]}`, '');
  }
}

export default TemplateGenerator;
