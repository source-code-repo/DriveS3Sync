const {google} = require('googleapis');
const fs = require('fs');

exports.setup = setup;
exports.filesAndIds = getFilesAndIds;
exports.download = download;

let drive;

async function setup() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'SecretKey.json',
    scopes: [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.readonly'],
  });
  let authClient = await auth.getClient();
  drive = google.drive({version: 'v3', auth: authClient});
}

async function download(fileId, fileName) {
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(fileName);
    console.log('GDrive Download  ' + fileId);
    drive.files.get({fileId, alt: 'media'}, {responseType: 'stream'})
      .then(res => {
        res.data.on('end', () => {
          dest.end();
          resolve();
        }).pipe(dest);
      })
      .catch(err => reject(err))
  });
}

async function getFilesAndIds() {
  let nextPageToken = null;
  let filesAndIds = [];
  // Iterate over each page
  while (nextPageToken !== undefined) {
    console.log('GDrive retrieving file list');
    const response = await drive.files.list({
      pageSize: 1000,
      pageToken: nextPageToken,
      q: "mimeType!='application/vnd.google-apps.folder'",
      fields: 'nextPageToken, files(id, name, parents)',
    });
    filesAndIds = filesAndIds.concat(await pathAndIdOf(response.data.files));
    nextPageToken = response.data.nextPageToken;
  }
  return filesAndIds;
}

async function pathAndIdOf(files) {
  return await Promise.all(
    files.map(async (file) => {
      return {path: await pathOf(file.parents, '') + '/' + file.name, driveId: file.id};
    })
  );
}

// Build the path to an item. Path parameter must  be empty when not called
// recursively.
async function pathOf(id, path) {
  if (id === undefined) {
    return '';
  }
  const response = await nameAndParentsOf(id);
  if (path === '') {
    path = response.name;
  } else {
    path = response.name + '/' + path;
  }
  if (response.parents === undefined) {
    return path;
  }
  return pathOf(response.parents[0], path);
}

// Get a file's name and parent ID
// Returns a promise that returns the drive.files.get response's data
// Caches results for the duration of execution
let cache = {};
async function nameAndParentsOf(id) {
  if (cache[id] === undefined) {
    console.log('GDrive get file name and parent ' + id);
    cache[id] = drive.files.get({fileId: id, fields: 'name,parents'})
      .then(x => x.data);
  }
  return cache[id];
}
