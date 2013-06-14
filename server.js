
/**
 * Module dependencies.
 */

var express = require('express');


var app = module.exports = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.set('port', 4000);

  app.use('/admin', function(req, res, next) {
    if (req.connection.remoteAddress != "127.0.0.1") res.send(401);
    else next();
  });

  app.use(express.static(__dirname + '/public'));

  app.use(express.logger());
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  app.use(app.router);


});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  app.set('port', 4001);
});

app.configure('production', function(){
  app.use(express.errorHandler());

});

var Memcached = require('memcached'),
    memcached = new Memcached('127.0.0.1:11211');

require('./apps/mobile/admin')(app, memcached);
require('./apps/mobile/routes')(app, memcached);
//require('./apps/generate/routes')(app);

app.listen(app.settings.port, function(){
  console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
});
