
/**
 * Module dependencies.
 */

var express = require('express');

require('express-namespace');
require('./apps/schema');


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('port', 4000);

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  // Use logging middleware
  app.use(express.logger());
  //app.use(logging.requestLogger);
  
  //app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  
  app.set('port', 4001);
  app.set('dburl', 'mongodb://localhost/ssm-dev');
});

app.configure('production', function(){
  app.use(express.errorHandler());

  app.set('dburl', 'mongodb://localhost/ssm-prod');

});


require('mongoose').connect(app.settings.dburl);

require('./apps/mobile/routes')(app);
require('./apps/generate/routes')(app);

app.listen(app.settings.port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
