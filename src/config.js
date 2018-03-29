import Defaults from './defaults';
import drop from 'lodash/fp/drop';
import flow from 'lodash/fp/flow';
import fs from 'fs';
import get from 'lodash/fp/get';
import gt from 'lodash/fp/gt';
import identity from 'lodash/fp/identity';
import isUndefined from 'lodash/fp/isUndefined';
import join from 'lodash/fp/join';
import merge from 'lodash/fp/merge';
import size from 'lodash/fp/size';

const Config = (argv) => {
  let defaults = Defaults;

  if (!isUndefined(argv.defaults)) {
    if (!fs.existsSync(argv.defaults)) {
      throw 'The <defaults> file doesn\'t exist!';
    }

    defaults = merge(defaults)(JSON.parse(fs.readFileSync(argv.defaults)));
  }

  const getArgOrDefault = (key, parseArg = identity) => {
    const value = get(key)(argv);

    return (
      isUndefined(value)
        ? get(key)(defaults)
        : parseArg(value)
    );
  };
  const secondArg = get(1)(argv._);

  return {
    action: get(0)(argv._),
    branches: {
      develop: getArgOrDefault('branches.develop'),
      doc: getArgOrDefault('branches.doc'),
      feature: getArgOrDefault('branches.feature'),
      fix: getArgOrDefault('branches.fix'),
      hotfix: getArgOrDefault('branches.hotfix'),
      master: getArgOrDefault('branches.master'),
      release: getArgOrDefault('branches.release')
    },
    categories: getArgOrDefault('categories', JSON.parse),
    helpOn: secondArg,
    isDoc: argv.doc,
    isRelease: argv.release,
    labels: {
      breaking: getArgOrDefault('labels.breaking'),
      doc: getArgOrDefault('labels.doc'),
      feature: getArgOrDefault('labels.feature'),
      fix: getArgOrDefault('labels.fix'),
      release: getArgOrDefault('labels.release'),
      wip: getArgOrDefault('labels.wip')
    },
    name: (
      flow(
        size,
        gt(3)
      )(argv._)
        ? undefined
        : flow(
          drop(2),
          join(' ')
        )(argv._)
    ),
    number: get(2)(argv._),
    owner: getArgOrDefault('owner'),
    position: secondArg,
    repo: getArgOrDefault('repo'),
    tag: getArgOrDefault('tag'),
    token: getArgOrDefault('token')
  };
};

export default Config;
