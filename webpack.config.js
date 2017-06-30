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
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.template$/,
        use: 'raw-loader',
      },
    ],
  },
  target: 'node',
  externals: {
    'geoip-country-lite': 'geoip-country-lite',
    winston: 'winston',
    mongoose: 'mongoose',
    mongodb: 'mongodb',
    redis: 'redis',
  },
  output: {
    path: path.join(__dirname, '/dist/'),
    library: '[name]',
    libraryTarget: 'commonjs2',
    filename: '[name].js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: true,
      mangle: false,
      sourcemap: false,
      compressor: {
        warnings: false,
      },
    }),
  ],
};
