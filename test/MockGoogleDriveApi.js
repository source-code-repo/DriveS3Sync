// Use Jest to mock out GoogleDrive API calls
// Requires googleapis to already be mocked by the test
// e.g. jest.mock('googleapis');
const {google} = require('googleapis');

/**
 * Mock out calls to Google Drive's list files API
 * and Get Files API to simulate a file download
 * @param returnValue to be returned from the mocked call
 */
function mockDriveListFiles(returnValue) {
  // Mock for "on" function call when retrieving a Google Drive file's data
  const driveFileGetDataOnFn = (endVal, callback) => {
    callback();
    return {
      pipe: () => null // no-op
    };
  }

  const driveFileGetFn = (id, fields) => {
    return Promise.resolve({
      data: {
        name: 'parentName',
        on: driveFileGetDataOnFn
      }
    })
  };

  // Given
  google.drive.mockImplementation(() => ({
    files: {
      list: () => (returnValue),
      get: driveFileGetFn
    }
  }));
}

exports.mockDriveListFiles = mockDriveListFiles;