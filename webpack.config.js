const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: fs.readdirSync(path.join(__dirname, './src'))
         .filter(filename => /\.js$/.test(filename))
         .map((filename) => {
           const entry = {};
           entry[filename.replace('.js', '')] = path.join(
             __dirname,
             './src/',
             filename);
           return entry;
         })
         .reduce((finalObject, entry) => Object.assign(finalObject, entry), {}),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015'],
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.join(__dirname, '/dist/'),
    library: '[name]',
    libraryTarget: 'commonjs2',
    filename: '[name].min.js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: true,
      mangle: true,
      sourcemap: false,
      compressor: {
        warnings: false,
      },
    }),
  ],
};
