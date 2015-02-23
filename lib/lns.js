let lns = module.exports;

let commands = [
  'add'
//  'config',
//  'init',
//  'update'
];

for (let c of commands) {
  lns[c] = require(`./${c}.js`);
}
