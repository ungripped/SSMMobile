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
		//var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
		var today = new Date();
		today.setFullYear(1912);
		var dateString = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ask&query=%5B%5BKategori%3AR%C3%A5varor%5D%5D+%5B%5BI+s%C3%A4song%3A%3A" + dateString + "%5D%5D|?Kategori|?Bild|?Intresse|?I%20s%C3%A4song|limit=500&format=json";
		doSSMRequest(url, mongoose.model('ArticleList'), 'Råvaror', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	},
	recipes: function(mongoose) {
		//var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";

		var today = new Date();
		today.setFullYear(1912);
		var dateString = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
		var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ask&query=%5B%5BKategori%3ARecept%5D%5D+%5B%5BI+s%C3%A4song%3A%3A" + dateString + "%5D%5D|?Kategori|?Bild|?Intresse|?I%20s%C3%A4song|limit=500&format=json";
		doSSMRequest(url, mongoose.model('RecipeList'), 'Recept', function() {
			setTimeout(function() {
				console.log("Quitting...");
				process.exit(0);
			}, 2000);
		});
	}
}	
