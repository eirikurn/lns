const archy = require('archy');
const pathUtil = require('path');
const Promise = require('bluebird');
const colors = require('colors/safe');
const sortBy = require('lodash/sortBy');
const fs = require('./fs');

module.exports = async (paths) => {
  let tree = await toTree(paths);
  tree = fixTree(tree);

  tree.forEach(node => {
    process.stdout.write(archy(node));
  });
};

function fixTree(nodes) {
  const sortedNodes = sortBy(nodes, 'label');
  for (let i = 0, node; (node = sortedNodes[i]); i++) {
    while (node.nodes && node.nodes.length === 1) {
      const child = node.nodes[0];
      child.label = pathUtil.join(node.label, child.label);
      node = nodes[i] = child;
    }
    if (node.nodes && node.nodes.length > 1) {
      node.nodes = fixTree(node.nodes);
    }
  }
  return sortedNodes;
}

async function toTree(paths) {
  const nodes = {};
  const roots = [];
  let remaining = paths;

  const reducePath = async (next, path) => {
    const actualPath = path.path || path;
    const node = nodes[actualPath] = nodes[actualPath] || {};
    node.label = pathUtil.basename(actualPath) || actualPath;
    if (path.linked === false) {
      node.label = colors.yellow(node.label);
    } else if (path.linked === true) {
      node.label = colors.green(node.label);
    }
    const exists = await fs.exists(actualPath);
    if (!exists) {
      node.label = colors.dim(node.label);
    }

    const dir = pathUtil.dirname(actualPath);
    let dirNode = nodes[dir];

    // New dir node
    if (!dirNode) {
      dirNode = nodes[dir] = {
        nodes: [],
      };
      next.push(dir);
    }

    // Are we at a root.
    if (dirNode === node) {
      roots.push(node);
    } else {
      dirNode.nodes.push(node);
    }

    return next;
  };

  while (remaining.length) {
    remaining = await Promise.reduce(remaining, reducePath, []);
  }

  return roots;
}
