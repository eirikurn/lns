/* eslint-disable no-console */
const log = require('npmlog');

module.exports = (err) => {
  // TODO: Make more friendly error reports.
  console.log(err);
  log.error('lns', err);
};
