const fs = require('fs');
const archiver = require('archiver');
const rimraf = require('rimraf');
const AWS = require('aws-sdk');
const { gitDescribe } = require('git-describe');

const cleanupOldDeployments = () => {
  const promise = new Promise((resolve, reject) => {
    rimraf('./dist/*.zip', (err) => {
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
        if (response.dirty) throw new Error('Please check in working tree before deploying.');
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
        output.on('close', () => {
          resolve({ artifactVersion });
        });
        archive.on('error', (err) => {
          throw new Error(err);
        });
        archive.pipe(output);
        archive.file('dist/index.js', { name: 'index.js' });
        archive.file('config/aws.json');

        // External Dependencies are included separately here.
        // They should only be included if they do not work with webpack2.
        // archive.directory('node_modules/geoip-country-lite');

        // MongoDB Dependencies
        // archive.directory('node_modules/mongoose');
        // archive.directory('node_modules/mongodb');
        // archive.directory('node_modules/mongodb-core');
        // archive.directory('node_modules/bson');
        // archive.directory('node_modules/require_optional');

        // Redis Dependencies
        // archive.directory('node_modules/redis');
        // archive.directory('node_modules/double-ended-queue');
        // archive.directory('node_modules/redis-parser');
        // archive.directory('node_modules/redis-commands');

        archive.directory('node_modules');

        archive.finalize();
      })
      .catch((err) => {
        reject(err);
      });
  });
  return promise;
};

const deployLambdaFunctionToTest = () => {
  const promise = new Promise((resolve) => {
    getArtifactVersionForDeployment()
      .then((artifactVersion) => {
        AWS.config.loadFromPath('./config/aws.json');
        const lambda = new AWS.Lambda();

        const updateFunctionCodeConfig = {
          FunctionName: 'jackson-lambda',
          Publish: true,
          ZipFile: fs.readFileSync(`${__dirname}/../dist/${artifactVersion}.zip`),
        };

        lambda.updateFunctionCode(updateFunctionCodeConfig, (err, data) => {
          if (err) throw new Error(err);
          else {
            resolve(data);
          }
        });
      });
  });
  return promise;
};

cleanupOldDeployments()
  .then(createArtifactForDeployment)
  .then(deployLambdaFunctionToTest)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
