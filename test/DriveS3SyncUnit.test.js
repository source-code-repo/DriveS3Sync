const driveS3Sync = require('../DriveS3Sync');
const googleDrive = require('../GoogleDrive');
const aws = require('../AWS');
const fs = require('fs');

jest.mock('../GoogleDrive');
jest.mock('../AWS')

const driveFiles = [
  { path: 'tmp/path1', driveId: 'id1'},
  { path: 'tmp/path2', driveId: 'id2'},
];

const s3Files = [
  'tmp/path1',
  'tmp/path3'
]

test('DriveS3SyncTest', () => {
  // Given
  googleDrive.filesAndIds.mockResolvedValue(driveFiles);
  aws.listFiles.mockResolvedValue(s3Files);
  // googleDrive.download creates a file which is later deleted.
  // Need to create the file here too or the delete fails.
  googleDrive.download.mockImplementation((driveId, tmpFileName) => {
    fs.closeSync(fs.openSync(tmpFileName, 'w'));
  });

  // When
  return driveS3Sync.handler().then(() => {
    // Then
    expect(aws.upload.mock.calls[0][0]).toBe('tmp/path2');
  });
});