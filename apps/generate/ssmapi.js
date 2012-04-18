var api = function() {

	var request 	= require('request'),
		_			= require('underscore'),
		promise     = require('node-promise'),
		async		= require('async'),
		renderer 	= require('./season-renderer');


	var self = this;

	

	this.loadImageUrl = function(img, promise) {
		if (img && img != "Fil:Recept ikon sasongsmat.png") {
			var imgurl = encodeURI("http://xn--ssongsmat-v2a.nu/w/api.php?action=query&prop=imageinfo&titles=" + img + "&iiprop=url&iiurlwidth=120&format=json");
			
			request(imgurl, function(error, response, body) {
				var res = JSON.parse(body);
				// ICK!
				var thumb = _(res.query.pages).values()[0].imageinfo[0].thumburl;
				promise.resolve(thumb);
			})
		}
		else {
			promise.resolve(null);
		}
	}

	this.loadSSMData = function(url, cb) {
		var r = request(url, function(error, response, body) {
			var resultObj = JSON.parse(body);
			var values = _(resultObj.ssm).values();
			
			values.sort(function(a, b) { return a.nyckel - b.nyckel });

			// process each object and synchronize the result 
			// (i.e. wait for all to finish - multiple async calls...)
			async.map(values, function(val, callback) {
				val.sasong = _(val.sasong).values();

				var renderPromise = new promise.Promise();
				var imagePromise  = new promise.Promise();

				// do the actual async stuff:
				self.loadImageUrl(val.bild, imagePromise);
				renderer.render(val.sasong, renderPromise);

				promise.all([renderPromise, imagePromise]).then(function(result) {
					val.s1 = result[0];
					val.thumb = result[1];

					// "mark" this val as "finished" for async.map:
					callback(null, val);
				});
			}, function(err, results) {
				// This is the *final* async.map callback - i.e. when all 
				// items have finished.

				cb(results);
			});		
/*
			var renderPromise = new Promise();


			console.log(values);*/
		});
	}

	return this;
}();

module.exports = api;

/*function loadSSMData(url, fileName, response) {
	var client = new httpclient.httpclient();
	
	client.perform(url, "GET", function(result) {
		var resultObj = JSON.parse(result.response.body);
		var values = $(resultObj.ssm).values();
		
		values.sort(function(a, b) {
			return a.nyckel - b.nyckel;
		});
		
		async.map(values, function(o, callback) {
			renderSeason($(o.sasong).values(), function(fileName) {
				o.s1 = fileName;
			});
			
			if (o.bild && o.bild != "Fil:Recept ikon sasongsmat.png") {
				var imgurl = encodeURI("http://xn--ssongsmat-v2a.nu/w/api.php?action=query&prop=imageinfo&titles=" + o.bild + "&iiprop=url&iiurlwidth=120&format=json");
				
				client.perform(imgurl, "GET", function(r2) {
					var imgRes = JSON.parse(r2.response.body);
					o.thumb = $(imgRes.query.pages).values()[0].imageinfo[0].thumburl;
					callback(null, o);
				});
			}
			else {
				callback(null, o);
			}
			
		}, function(err, results) {
			if (!err)
				saveJSON(fileName, values, response);
			else 
				console.log("Error: " + err);
		});
	});
}
*/