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

	this.parseValues = function(data) {
		data = _.filter(data, function(obj) { return obj.fulltext.indexOf('Special:') == -1; });

		var values = _.map(data, function(obj) {
			var newObj = {};
	    
	    if (obj.fulltext.indexOf("Recept:") != -1) {
	    	newObj.namn = obj.fulltext.substring(7);
	    }
	    else {
		    newObj.namn = obj.fulltext;
		  }
	    
	    if (obj.printouts.Bild[0])
	    	newObj.bild = obj.printouts.Bild[0].fulltext;
	    
	    newObj.kategori = obj.printouts.Kategori[0].fulltext.substring(9);
	    
	    var sasong = [0,0,0,0,0,0,0,0,0,0,0,0];
	    var totalSeasonDays = 0;
	    var inSeasonDays = 0;
	    var today = new Date();
	    today.setFullYear(1912);

	    _(obj.printouts["Har säsong den"]).each(function(d) {
	    	var date = new Date();
        date.setTime(d*1000);

        if (date.getTime() < today.getTime()) inSeasonDays++;
        totalSeasonDays++;

        sasong[date.getMonth()]++;
	    });

	    if (obj.printouts.Intresse.length > 0) {
		    var intresse = obj.printouts.Intresse[0];

		    newObj.nyckel = inSeasonDays * 2 + totalSeasonDays - intresse * 50;
		  }
		  else {
		  	newObj.nyckel = 1000;
		  }
	    newObj.sasong = sasong;

	    return newObj;
		});
		
		return values;
	}

	this.loadSSMData = function(url, cb) {
		var r = request(url, function(error, response, body) {
			console.log(body);
			var resultObj = JSON.parse(body);
			//var values = _(resultObj.ssm).values();
			console.log("Parsing values");
			var values = self.parseValues(_(resultObj.query.results).values());
			
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
				console.log("All promises done...");
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