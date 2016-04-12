const { spawn } = require('child_process');

module.exports = (...args) =>
  new Promise((resolve, reject) => {
    const process = spawn(...args);
    process.on('close', resolve);
    process.on('error', reject);
  });
