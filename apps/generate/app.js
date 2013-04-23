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

var day = function() {
	var now = new Date();
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = now - start;
	var oneDay = 1000 * 60 * 60 * 24;
	return day = Math.floor(diff / oneDay);
}

module.exports = {
	articles: function(mongoose) {
		//var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
		
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ask&query=[[Kategori:Råvaror]]+[[Har%20säsong%20den::" + day() + "]]|?Kategori|?Bild|?Intresse|?Har%20säsong%20den|limit=500&format=json";
		console.log(url);
		doSSMRequest(url, mongoose.model('ArticleList'), 'Råvaror', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	},
	recipes: function(mongoose) {
		//var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ask&query=[[Kategori:Recept]]+[[Har%20säsong%20den::" + day() + "]]|?Kategori|?Bild|?Intresse|?Har%20säsong%20den|limit=500&format=json";
		doSSMRequest(url, mongoose.model('RecipeList'), 'Recept', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	}
}	
