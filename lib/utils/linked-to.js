let co = require('co');
let fs = require('./fs');

/**
 * Checks if a file path is a symlink to a specific file.
 */
module.exports = co.wrap(function*(source, target) {
  try {
    return (yield fs.readlink(source)) === target;
  } catch(err) {
    // EINVAL = file, not symlink.
    if (err.code === 'EINVAL') {
      return false;
    }
    throw err;
  }
});
