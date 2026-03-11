let config = require('@ucd-lib/cork-app-build').watch({
  root: __dirname,
  entry: 'public/elements/demo-main.js',
  preview: 'public/dist/',
  clientModules: 'node_modules'
});

module.exports = config;