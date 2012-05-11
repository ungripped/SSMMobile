var _			= require('underscore');

var doSSMRequest = function(url, Model, title, cb) {
	var api = require('./ssmapi');

	api.loadSSMData(url, function(data) {

		var list = new Model({
			date: new Date(),
			title: title,
			list: data
		});
		console.log("Saving list: " + title + "...");
		list.save(function(err) { 
			if (err) {
				console.log("Could not save list: " );
				console.log(err);
			}
			else {
				console.log("List saved...");
			}
		});
		cb();
	});
}

module.exports = {
	articles: function(mongoose) {
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
		doSSMRequest(url, mongoose.model('ArticleList'), 'Råvaror', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	},
	recipes: function(mongoose) {
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";
		doSSMRequest(url, mongoose.model('RecipeList'), 'Recept', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	}
}	
