const lns = require('./lns');
const pathUtil = require('path');
const store = require('./store');
const spawn = require('./utils/spawn');
const spawnArgs = require('spawn-args');
const { safeRealpath } = require('./utils/fs');

module.exports = diff;
diff.usage = [
  'diff <path>',
  'diffs files against store',
];

async function diff(args, options) {
  const diffCmd = lns.config.get('diff');
  const [command, ...diffArgs] = spawnArgs(diffCmd, { removequotes: true });

  const source = pathUtil.join(lns.config.get('_cwd'), options.path);
  const target = store.externalToLocal(source);
  const realSource = await safeRealpath(source);

  await spawn(command, [...diffArgs, realSource, target], { stdio: 'inherit' });
}
