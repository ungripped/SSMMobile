var mongoose 	= require('mongoose'),
		_			= require('underscore');

var doSSMRequest = function(url, Model, title, cb) {
	var api = require('./ssmapi');

	api.loadSSMData(url, function(data) {

		var list = new Model({
			date: new Date(),
			title: title,
			list: data
		});
		console.log("Saving list: " + title + "...");
		list.save();
		cb();
	});
}

module.exports = {
	articles: function() {
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
		doSSMRequest(url, mongoose.model('ArticleList'), 'Råvaror', function() {
			process.exit(0);
		});
	},
	recipes: function() {
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";
		doSSMRequest(url, mongoose.model('RecipeList'), 'Recept', function() {
			process.exit(0);
		});
	}
}	
