import _ from 'lodash';
import fs from 'fs';

const TemplateGenerator = () => {
  const loadTemplateFromFile = filePath => fs.readFileSync(filePath);

  const getTemplateString = ({ templateValues = {}, filePath }) => {
    const compiled = _.template(loadTemplateFromFile(filePath));
    return compiled(templateValues);
  };

  const getTemplate = ({ template, url, ghostClick }) => {
    const templates = {
      jquery: getTemplateString({ filePath: `${__dirname}/templates/src/jquery-template.js` }),
      ghostClick: getTemplateString({ filePath: `${__dirname}/templates/src/ghost-click-template.js`, ghostClick }),
      takeRate: getTemplateString({ filePath: `${__dirname}/templates/src/take-rate-template.js`, url }),
    };
    return `${templates[template]}${templates.ghostClick}${templates.takeRate}`;
  };

  return {
    getTemplate,
  };
};

export default TemplateGenerator();
