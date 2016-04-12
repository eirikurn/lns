const fs = require('./fs');

/**
 * Checks if a file path is a symlink to a specific file.
 */
module.exports = async (source, target) => {
  try {
    return (await fs.readlink(source)) === target;
  } catch (err) {
    // EINVAL = file, not symlink.
    if (err.code === 'EINVAL') {
      return false;
    }
    // ENOENT = no such file or directory.
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};
