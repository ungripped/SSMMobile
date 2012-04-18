var routes = function(app) {

	var mongoose 	= require('mongoose');

	var getDateQuery = function() {
		var today = new Date();
		today.setHours(0);today.setMinutes(0); today.setSeconds(0);
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);

		return {$gte: today, $lt: tomorrow};
	}

	var doRequest = function(res, model, view) {
		model.findOne({date: getDateQuery()}, function(error, data) {
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