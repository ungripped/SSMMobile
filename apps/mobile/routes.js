var routes = function(app) {

	var mongoose 	= require('mongoose');

	var doRequest = function(res, model, view) {
		model.findOne().sort('date', -1).run(function(error, data) {
			if (error == null) {
				res.render(__dirname + "/views/" + view, data);
			}
			else {
				throw new Error(error);
			}
		});
	}

	app.get('/articles', function(req, res) {
		doRequest(res, mongoose.model('ArticleList'), 'articles');
	});

	app.get('/recipes', function(req, res) {
		doRequest(res, mongoose.model('RecipeList'), 'recipes');
	});
};

module.exports = routes;