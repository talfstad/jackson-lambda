const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const context = path.join(__dirname, '../lib/response-generator/lib/template-generator/templates');
const entry = fs.readdirSync(path.join(context, 'src'))
 .filter(filename => /\.js$/.test(filename))
 .map((filename) => {
   const entryLocation = {};
   entryLocation[filename.replace('.js', '')] = path.join(context, 'src', filename);
   return entryLocation;
 })
 .reduce((finalObject, entryLocation) => Object.assign(finalObject, entryLocation), {});

webpack({
  context,
  entry,
  target: 'node',
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
    path: path.join(context, 'dist'),
    filename: '[name].min.js',
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
}, (err) => {
  if (err) throw new Error(err);
  console.log('Finished Building Templates Successfully');
});
