
/**
* Module dependencies.
*/

var express = require('express');
var app = module.exports = express.createServer();

var httpclient = require('./httpclient');

var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var async = require('async');

var Canvas = require('canvas');

$ = require('underscore');

var articlesFile = __dirname + '/data/articles.json';
var recipesFile = __dirname + '/data/recipes.json';



// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// Routes


function renderSeason(seasonInfo, cb) {
	var fileName = "";
	$(seasonInfo).each(function(item, index) {
		var s = "0";
		if (item > 0 && item < 15) { s = "1"; } 
		else if (item > 15 && item < 28) { s = "2"; }
		else if (item >= 28) { s = "3"; }
		fileName += s;
	});
	
	fileName += ".png";
	
	var filePath = __dirname + '/public/images/seasonIndicators/' + fileName;
	
	path.exists(filePath, function(exists) {
		//if (exists) {
		//	cb(fileName)
		//	return;
		//}
		//var canvas = new Canvas(230, 20);
		var canvas = new Canvas(460, 40);
		var ctx = canvas.getContext('2d');

		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.font = "11px sans-serif";
		ctx.lineWidth = 1;

		ctx.textBaseline = "middle";
	    ctx.textAlign = "center";

	    var man = new Array ("J","F","M","A","M","J","J","A","S","O","N","D");
	    var adj = new Array (2,-2,-2,0,-2, 2,2,0,-2,-2,-2,0);//höger/vänster-justering i pixlar av mpnadsbokstäver, fat de verkligen ska se centrerade ut
		var adjVertical = [-2, 0, 0, 0, 0, -2, -2, 0, 0, 0, 0, 0];
		$(seasonInfo).each(function(item, index) {
			var opac = 0;
			if (item > 0 && item < 15) { opac = .33; } 
			else if (item > 15 && item < 28) { opac = .67; }
			else if (item >= 28) { opac = 1; }

			//ctx.fillStyle = 'rgba(140, 198, 57,' + opac + ')';
			ctx.fillStyle = 'rgba(12, 157, 48,' + opac + ')';
			ctx.beginPath();
			//ctx.arc(10 + index*19, 10, 8, 0, Math.PI*2, true);
			ctx.arc(20 + index*38, 20, 16, 0, Math.PI*2, true);

			ctx.closePath();
	        ctx.fill();
	        ctx.stroke();

			ctx.fillStyle = 'rgba(0,0,0,1)';
			//ctx.fillText(man[index], index*19 + 10 + adj[index], 9 + adjVertical[index]);
			ctx.fillText(man[index], index*38 + 20 + adj[index], 18 + adjVertical[index]);
		});

		//console.log(filePath);
		var out = fs.createWriteStream(filePath);
		var stream = canvas.createPNGStream();

		stream.on('data', function(chunk){
		  out.write(chunk);
		});
		
		stream.on('end', function() {
			cb(fileName);
		});
	});
}

function loadSSMData(url, fileName, response) {
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
			
			if (o.bild) {
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

function saveJSON(fileName, values, response) {
	fs.writeFile(fileName, JSON.stringify(values), function(err) {
		if (err) {
			console.log("Could not write " + fileName + "!");
		}
		else {
			console.log(fileName + " written!");
		}

		response.send("OK");						
	});
	
}

app.get('/articles', function(req, res) {
	console.log("/articles");
	fs.readFile(articlesFile, function(err, data) {
		if (err) throw err;
		var d = JSON.parse(data);
		res.render('articles', {
			title: 'Artiklar',
			articles: d
		});
	});
});

app.get('/recipes', function(req, res) {
	console.log("/recipes");
	fs.readFile(recipesFile, function(err, data) {
		if (err) throw err;
		var d = JSON.parse(data);
		res.render('recipes', {
			title: 'Recept',
			recipes: d
		});
	});
});

app.get('/generaterecipes/KHfkejo3489Jhfwlk298265lsfjkkw9s87lf', function(req, res) {
	console.log('Fetching recipe list...');
	var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&kategori=Recept&props=kategori%2Cbild%2CNyckel&format=json";
	loadSSMData(url, recipesFile, res);
});

app.get('/generatearticles/hJHsne95298FKJghsnnakwej7I29875khksj82745', function(req, res){
	console.log("Fetching current article list...");
	var url = "http://xn--ssongsmat-v2a.nu/w/api.php?action=ssmlista&sasong=3&ns=0&props=kategori%2Cbild%2CNyckel&format=json";
	loadSSMData(url, articlesFile, res);
});


app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
