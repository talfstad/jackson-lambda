const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const fs = require('fs');
const archiver = require('archiver');
const rimraf = require('rimraf');
const AWS = require('aws-sdk');
const { gitDescribe } = require('git-describe');

const buildLatestVersion = () => {
  const promise = new Promise((resolve, reject) => {
    webpack(webpackConfig, (err) => {
      if (err) reject();
      resolve();
    });
  });
  return promise;
};

const cleanupOldDeployments = () => {
  const promise = new Promise((resolve, reject) => {
    rimraf('./dist/rs-glue-*', (err) => {
      if (err) reject();
      resolve();
    });
  });
  return promise;
};

const getArtifactVersionForDeployment = () => {
  const promise = new Promise((resolve, reject) => {
    // get the version from last tag.
    gitDescribe({ dirtySemver: false })
      .then((response) => {
        // if (response.dirty) throw new Error('Please check in working tree before deploying.');
        resolve(response.raw);
      })
      .catch(err => reject(err));
  });
  return promise;
};

const createArtifactForDeployment = () => {
  const promise = new Promise((resolve, reject) => {
    getArtifactVersionForDeployment()
      .then((artifactVersion) => {
        const archive = archiver('zip', {
          zlib: { level: 9 },
        });
        const output = fs.createWriteStream(`./dist/${artifactVersion}.zip`);
        archive.pipe(output);
        archive.file('dist/rs-glue.min.js', { name: 'rs-glue.js' });
        archive.finalize();
        resolve({ artifactVersion });
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

const deployLambdaFunctionToTest = () => {
  const promise = new Promise((resolve) => {
    AWS.config.loadFromPath('./config/aws.json');
    const lambda = new AWS.Lambda();

    const updateFunctionCodeConfig = {
      FunctionName: 'rs-glue',
      Publish: true,
      ZipFile: fs.readFileSync(`${__dirname}/../dist/v0.1-7-g584a1cc-dirty.zip`),
    };

    // get the version from git, then create function, publish
    lambda.updateFunctionCode(updateFunctionCodeConfig, (err) => {
      if (err) throw new Error(err);
      else resolve();
    });
  });
  return promise;
};

buildLatestVersion()
  .then(cleanupOldDeployments)
  .then(createArtifactForDeployment)
  .then(deployLambdaFunctionToTest)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
