var api = require('./api');

var routes = function(app, memcached) {
  app.get('/admin/updatelists', function(req, res) {
    api.articles(function(error, result) {
      api.recipes(function(error, result) {
        res.send("OK");
      });
    });
  });

  app.get('/admin/purge', function(req, res) {
    api.purge();
    memcached.del('ssm_mobile_articles', function() {});
    memcached.del('ssm_mobile_recipes', function() {});
    res.send("Purged");
  });
};

module.exports = routes;