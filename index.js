const async = require('async');
const exec = require('child_process').exec;

const usage = `
Update npm dependencies of your project with one command.

Examples:
update-to-latest
update-to-latest --path ./path/to/your/package.json
`;

const optimist = require('optimist')
  .usage(usage)
  .alias('p', 'path')
  .describe('p', 'Path to package.json file (optional)')
  .alias('h', 'help')
  .describe('h', 'Help')

const argv = optimist.argv;

if (argv.h) {
  optimist.showHelp();
  return;
}

const packageJSONPath = argv.path || `${process.cwd()}/package.json`;
const packageJSON = require(packageJSONPath);
const deps = packageJSON.dependencies || {};
const devDeps = packageJSON.devDependencies || {};

const tasks = Object
  .keys(deps)
  .map(dep => {
    return update(dep, '--save');
  });

const devTasks = Object
  .keys(devDeps)
  .map(dep => {
    return update(dep, '--save-dev');
  });

const taskList = [].concat(tasks, devTasks);

function update (dep, flag) {
  return done => {
    console.log('----> updating %s...', dep);
    exec(`npm i ${dep}@latest ${flag}`, err => {
      if (err) {
        return done(err);
      }

      console.log('+++++ updated %s!', dep);
      done(null);
    });
  };
}

async.series(taskList, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('🎉 Updates are ready!')
  process.exit(0);
});
