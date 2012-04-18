var obj = function() {

	var fs 		= require('fs'),
		path 	= require('path'),
		_ 		= require('underscore'),
		Canvas 	= require('canvas');


	this.render = function renderSeason(seasonInfo, promise) {
		var fileName = "";
		_(seasonInfo).each(function(item, index) {
			var s = "0";
			if (item > 0 && item < 15) { s = "1"; } 
			else if (item > 15 && item < 28) { s = "2"; }
			else if (item >= 28) { s = "3"; }
			fileName += s;
		});
		
		fileName += ".png";
		
		var filePath = __dirname + '/../../public/images/seasonIndicators/' + fileName;
		
		path.exists(filePath, function(exists) {
			//if (exists) {
			//	cb(fileName)
			//	return;
			//}
			//var canvas = new Canvas(230, 20);
			var canvas = new Canvas(460, 40);
			var ctx = canvas.getContext('2d');

			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.font = "22px sans-serif";
			ctx.lineWidth = 2;

			ctx.textBaseline = "middle";
		    ctx.textAlign = "center";

		    var man = new Array ("J","F","M","A","M","J","J","A","S","O","N","D");
		    var adj = new Array (1,-1,-1,0,-1, 1,1,0,-1,-1,-1,0);//höger/vänster-justering i pixlar av mpnadsbokstäver, fat de verkligen ska se centrerade ut
			var adjVertical = [-2, 0, 0, 0, 0, -2, -2, 0, 0, 0, 0, 0];
			_(seasonInfo).each(function(item, index) {
				var opac = 0;
				if (item > 0 && item < 15) { opac = .33; } 
				else if (item > 15 && item < 28) { opac = .67; }
				else if (item >= 28) { opac = 1; }

				//ctx.fillStyle = 'rgba(140, 198, 57,' + opac + ')';
				ctx.fillStyle = 'rgba(140, 198, 57,' + opac + ')';
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
				promise.resolve(fileName);
			});
		});
	}

	return this;
}();
module.exports = obj;