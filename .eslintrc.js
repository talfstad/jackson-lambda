module.exports = {
  'extends': 'airbnb',
  'plugins': [
    'react',
    'jsx-a11y',
    'import'
  ],
  'env': {
    'node': true,
    'mocha': true,
  },
  'rules': {
    'import/no-extraneous-dependencies': ['error', {'devDependencies': true, 'optionalDependencies': false, 'peerDependencies': false}],
    'no-underscore-dangle': 'off',
    'camelcase': 'off',
    'no-param-reassign': 'off',
  },
  'parser': 'babel-eslint',
};
