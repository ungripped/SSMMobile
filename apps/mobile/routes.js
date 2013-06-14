var api = require('./api');

var routes = function(app, memcached) {

	function get(cache, cb) {
		memcached.get( cache, function( err, result ) {
			if( err ) {
				cb(err, null);
			}
			else {
				if (result === false) {
					// no match in memcached
					console.log("No match in memcached, fetching from disk");

					var articles = api.latest(cache);

					cb(null, articles);

					memcached.set(cache, articles, 3600*24, function(err, result) {
						if (err) console.log("Could not set memcached: ", err);
						else if (result === true) console.log("Memcached data set");
						else console.log("Unknown memcached result");
					});
				}
				else {
					console.log("Found memcached result");
					cb(null, result);
				}
			}
		});
	}

	app.get('/api/list', function(req, res) {

	});

	app.get('/api/articles', function(req, res) {
		get('ssm_mobile_articles', function(err, articles) {
			if (err) res.send("An error has occured");
			else res.send(articles);
		});
	});

	app.get('/api/recipes', function(req, res) {
		get('ssm_mobile_recipes', function(err, recipes) {
			if (err) res.send("An error has occured");
			else res.send(recipes);
		});
	});

	app.get('/articles', function(req, res) {
		get('ssm_mobile_articles', function(err, articles) {
			if (err) throw new Error(err);
			res.render('articles', {list: articles});
		});
	});

	app.get('/recipes', function(req, res) {
		get('ssm_mobile_recipes', function(err, recipes) {
			if (err) throw new Error(err);
			res.render('recipes', {list: recipes});
		});
	});
};

module.exports = routes;