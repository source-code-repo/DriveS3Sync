const googleDrive = require('./GoogleDrive');
const aws = require('./AWS');
const fs = require('fs');
const {clearTmp, tmpFile} = require('./Tmp');

exports.handler = sync;

async function sync() {
  await clearTmp();
  await googleDrive.setup();
  await aws.setup('eu-west-2', 'backupjohncfiles');

  let driveFiles = await googleDrive.filesAndIds();
  let s3Files = await aws.listFiles();

  let differences = driveFiles.filter(x => {
    return !s3Files.includes(x.path);
  });

  for (let file of differences) {
    let tmpFileName = tmpFile();
    await googleDrive.download(file.driveId, tmpFileName);
    await aws.upload(file.path, tmpFileName);
    fs.unlinkSync(tmpFileName);
  }

  await aws.recordUploadCount();
  return;
}
