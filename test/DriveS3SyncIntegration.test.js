const driveS3Sync = require('../DriveS3Sync')
const jestAws = require('./MockAwsSdk');
const jestGoogleDrive = require('./MockGoogleDriveApi');

// TODO Ideally would mock this in each specific Mock*.js files
// but appears not to work
jest.mock('aws-sdk');
jest.mock('googleapis');

test('Upload files that are in Google Drive but not in AWS', () => {
  // Given
  jestGoogleDrive.mockDriveListFiles({
    data: {
      files: [
        {id: 'fileId1', parents: 'parent1', name: 'fileNotInAws1'}, // Expect a request to upload this
        {id: 'fileId2', parents: 'parent1', name: 'fileNotInAws2'}, // Expect a request to upload this
        {id: 'fileId3', parents: 'parent1', name: 'fileInGoogleDriveAndAws1'} // Don't expect this to be uploaded
      ]
    }
  });

  let listObjectsV2Mock = jestAws.awsFn({Contents: [{ Key: 'parentName/fileInGoogleDriveAndAws1'}]});
  let putObjectMock = jestAws.awsFn(null);
  jestAws.mockS3(listObjectsV2Mock, putObjectMock);
  jestAws.mockCw(jestAws.awsFn(null));

  // When
  return driveS3Sync.handler().then(() => {
    // Then
    expect(putObjectMock.mock.calls.length).toBe(2);
    expect(putObjectMock.mock.calls[0][0].Key).toBe('parentName/fileNotInAws1');
    expect(putObjectMock.mock.calls[1][0].Key).toBe('parentName/fileNotInAws2');
  });
});