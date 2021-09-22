const aws = require('aws-sdk');
const fs = require('fs');

exports.setup = setup;
exports.upload = upload;
exports.recordUploadCount = recordUploadCount;
exports.listFiles = listFiles;

let s3;
let uploaded = 0;
let bucket;

async function setup(region, passedBucket) {
  aws.config.loadFromPath('./Credentials.json');
  aws.config.update({region: region});
  try {
    console.log('S3 is ' + aws.S3);
    console.log('S3 typeof is ' + typeof(aws.S3));
    s3 = new aws.S3({apiVersion: '2006-03-01'});
  } catch (error) {
    console.log(error);
  }

  bucket = passedBucket;
  uploaded = 0;
}

async function listFiles() {
  preFlightCheck();
  let keys = [];
  let continuationToken = undefined;
  do {
    console.log('S3 fetch file list');
    let params = {Bucket: bucket};
    if (continuationToken !== undefined) {
      params.ContinuationToken = continuationToken;
    }

    let result = await s3.listObjectsV2(params).promise();
    keys = keys.concat(result.Contents.map(r => {
      return r.Key;
    }));
    continuationToken = result.NextContinuationToken;
  } while (continuationToken !== undefined)
  return keys;
}

async function upload(fileName, localPath) {
  preFlightCheck();
  console.log('S3 Uploading ' + fileName);
  let object = {
    Bucket: bucket,
    Key: fileName,
    Body: fs.readFileSync(localPath)
  };
  await s3.putObject(object).promise();
  console.log('S3 Upload Done ' + object.Key);
  uploaded++;
  console.log('Files uploaded ' + uploaded);
}

async function recordUploadCount() {
  preFlightCheck();
  let cw = new aws.CloudWatch({apiVersion: '2010-08-01'});
  let params = {
    MetricData: [
      {
        MetricName: 'FilesUploaded',
        Dimensions: [
          {
            Name: 'FilesUploaded',
            Value: 'Count'
          },
        ],
        Unit: 'None',
        Value: uploaded
      },
    ],
    Namespace: 'DriveS3Sync'
  };
  await cw.putMetricData(params).promise();
}

function preFlightCheck() {
  if (s3 === undefined) {
    throw 'Not initialized, please call setup()';
  }
}