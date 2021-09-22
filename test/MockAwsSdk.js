// Mocks out AWS SDK calls using Jest
// Requires aws-sdk to already be mocked by the test
// e.g. jest.mock('aws-sdk');
const aws = require('aws-sdk');

/**
 * Syntactic sugar for mocking out AWS-SDK calls that return a promise
 *
 * Creates a Jest mock function that returns the passed parameter,
 * from a "promise" method call.
 *
 * e.g. let result = await s3.listObjectsV2(params).promise();
 *
 * TODO Return the value in a promise
 * @returnValue returnValue
 * @returns {*}
 */
function awsFn(returnValue) {
  return jest.fn(() => ({
    promise: () => (returnValue)
  }));
}

/**
 * Mock out calls to AWS S3
 * @param listObjectsV2Response
 * @param putObjectResponse
 */
function mockS3(listObjectsV2Function, putObjectFunction) {
  // Could be improved? https://hugtech.io/2019/07/05/simplify-mocking-aws-sdk-with-jest/
  aws.S3 = jest.fn(() => ({
    listObjectsV2: listObjectsV2Function,
    putObject: putObjectFunction
  }));
}

/**
 * Mocks out calls to AWS Cloudwatch
 * @param putMetricDataMock
 */
function mockCw(putMetricDataMock) {
  aws.CloudWatch = jest.fn(() => ({
    putMetricData: () => ({
      promise: () => putMetricDataMock
    })
  }));
}

exports.mockS3 = mockS3;
exports.awsFn = awsFn;
exports.mockCw = mockCw;