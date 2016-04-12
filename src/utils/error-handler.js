/* eslint-disable no-console */
const PrettyError = require('pretty-error');
const pe = new PrettyError();
pe.skipPackage('babel-runtime');

module.exports = (err) => {
  if (err.simple) {
    console.log(err.message);
    return;
  }

  const renderedError = pe.render(err);
  console.log(renderedError);
};
