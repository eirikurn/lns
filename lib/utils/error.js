/* eslint-disable no-param-reassign */
module.exports = (message, type, simple) => {
  if (typeof type === 'boolean') {
    simple = type;
    type = null;
  }

  const error = new Error(message);
  error.type = type;
  error.simple = simple;
  return error;
};
