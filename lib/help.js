/* eslint-disable no-console */
const lns = require('./lns');

module.exports = help;

async function help([section]) {
  // lns help <noargs>:  show basic usage
  if (!section) {
    lnsUsage();
    return;
  }

  // lns <cmd> -h: show command usage
  if (lns.commands[section] && lns.commands[section].usage) {
    console.log(lns.commands[section].usage);
    return;
  }

  console.log(`No results for "${section}"`);
}

function lnsUsage() {
  console.log([
    '\nUsage: lns <command>',
    '',
    usages(),
    '',
    'lns help <command>  search for help on <command>',
    '',
    'lns@' + lns.version,
  ].join('\n'));
}

function usages() {
  return Object.keys(lns.commands)
    .filter(command => command !== 'help')
    .map(command => `lns ${command}`)
    .join('\n');
}
