const corkBuild = require("@ucd-lib/cork-app-build");

module.exports = corkBuild.dist({
  root: __dirname,
  client: "public",
  clientModules: ["node_modules"],
  entry: "public/elements/demo-main.js",
  dist: "public/dist",

});