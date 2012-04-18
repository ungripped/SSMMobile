var routes = function(app) {

	var mongoose 	= require('mongoose'),
		_			= require('underscore');

	app.namespace('/generate', function() {
		app.all('/*', function(req, res, next) {
			if (req.connection.remoteAddress != "127.0.0.1" && req.connection.remoteAddress != "109.74.5.165") {
				console.log("Unauthorized access from: " + req.connection.remoteAddress);
				throw new Error('Unauthorized');
			}

			next();
		});

		var doSSMRequest = function(res, url, Model, title, listKey) {
			var api = require('./ssmapi');

			api.loadSSMData(url, function(data) {

				var list = new Model({
					date: new Date(),
					title: title,
					list: data
				});
				list.save();

				res.send("OK");
			});
		}

		app.get('/articles', function(req, res) {
			var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
			doSSMRequest(res, url, mongoose.model('ArticleList'), 'Råvaror');
		});

		app.get('/recipes', function(req, res) {
			var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";
			doSSMRequest(res, url, mongoose.model('RecipeList'), 'Recept');
		});
	});
};

module.exports = routes;