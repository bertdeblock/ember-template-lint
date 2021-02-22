'use strict';

const { builders: b } = require('ember-template-recast');

const Rule = require('./base');

const TRANSFORMATIONS = {
  hasBlock: 'has-block',
  hasBlockParams: 'has-block-params',
};

function getErrorMessage(name) {
  return `\`${name}\` is deprecated. Use the \`${TRANSFORMATIONS[name]}\` helper instead.`;
}

module.exports = class RequireHasBlockHelper extends Rule {
  visitor() {
    return {
      PathExpression(node, path) {
        if (this.mode === 'fix') {
          if (TRANSFORMATIONS[node.original]) {
            let parent = path.parent;
            let isBlockStatement = parent.node.type === 'BlockStatement';
            let isImplicitInvocation =
              ['MustacheStatement', 'SubExpression'].includes(parent.node.type) &&
              parent.node.path.original !== node.original;
            if (isBlockStatement || isImplicitInvocation) {
              parent.node.params[0] = b.sexpr(TRANSFORMATIONS[node.original], []);
            } else {
              node.original = TRANSFORMATIONS[node.original];
            }
          }
        } else {
          if (TRANSFORMATIONS[node.original]) {
            this.log({
              message: getErrorMessage(node.original),
              line: node.loc && node.loc.start.line,
              column: node.loc && node.loc.start.column,
              source: this.sourceForNode(node),
              isFixable: true,
            });
          }
        }
      },
    };
  }
};

module.exports.getErrorMessage = getErrorMessage;