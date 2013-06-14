var Memcached = require('memcached'),
    memcached;

if (process.argv[3] == 'development') {
  memcached = new Memcached('localhost:11211');
}
else if (process.argv[3] == 'production') {
  memcached = new Memcached('localhost:11211');
}
else {
  console.log("Usage: ");
  console.log("node generate.js articles|recipes development|production");
  process.exit();
}


var generate = require('./apps/generate/app');

if (process.argv[2] == 'articles') {
  generate.articles(memcached);
}
else if (process.argv[2] == 'recipes') {
  generate.recipes(memcached);
}