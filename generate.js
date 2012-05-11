var mongoose = require('mongoose');

if (process.argv[3] == 'development') {
  console.log("Connecting to development database");
  mongoose.connect('mongodb://localhost/ssm-dev');
}
else if (process.argv[3] == 'production') {
  console.log("Connecting to production database");
  mongoose.connect('mongodb://localhost/ssm-prod');
}
else {
  console.log("Usage: ");
  console.log("node generate.js articles|recipes development|production");
  process.exit();
}

require('./apps/schema');

var generate = require('./apps/generate/app');

if (process.argv[2] == 'articles') {
  generate.articles(mongoose);
}
else if (process.argv[2] == 'recipes') {
  generate.recipes(mongoose);
}