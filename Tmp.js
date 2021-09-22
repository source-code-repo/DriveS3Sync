const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);
const {tmpdir} = require('os');
const crypto = require('crypto');
const path = require('path');

exports.tmpFile = tmpFile;
exports.clearTmp = clearTmp;

// https://stackoverflow.com/a/49421028
function tmpFile() {
  return path.join(tmpdir(), `archive.${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}`);
}

async function clearTmp() {
  const files = await readdir(tmpdir());
  const unlinkPromises = files.map(filename => () => {
    unlink(`${tmpdir()}/${filename}`)
  });
  return Promise.all(unlinkPromises);
}