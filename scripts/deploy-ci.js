const fs = require('fs');
const archiver = require('archiver');
const rimraf = require('rimraf');
const AWS = require('aws-sdk');
const { gitDescribe } = require('git-describe');
// const gitRev = require('git-rev');

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
        archive.file('dist/rs-glue.min.js', { name: 'rs-glue.js' });
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
          FunctionName: 'rs-glue',
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

// const enforceOnMasterBranch = () => {
//   const promise = new Promise((resolve) => {
//     gitRev.branch((branch) => {
//       if (branch !== 'master')
//           throw new Error('Not deploying to test. Must be on master branch.');
//       else resolve();
//     });
//   });
//   return promise;
// };

// enforceOnMasterBranch()
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
