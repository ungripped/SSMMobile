var promise   = require('node-promise'),
    _         = require('underscore'),
    async     = require('async'),
    fs        = require('fs'),
    renderer  = require('./season-renderer'),
    smw       = require('./smw');

var dataPath = './data/json/';

var fileutils = {};

fileutils.save = function(file, data) {
  if (this.isUpdated(file, data))
    fs.writeFileSync(dataPath + file + '.json', data, {flag: 'w'});
  else
    console.log("No data update");
};

fileutils.read = function(file) {
  return fs.readFileSync(dataPath + file + '.json', {encoding: 'utf8'});
};

fileutils.isUpdated = function(file, data) {
  if (!fs.existsSync(dataPath + file + '.json')) return true;
  var old = this.read(file);
  return old !== data;
};

fileutils.unlink = function(file) {
  fs.unlinkSync(dataPath + file + '.json');
};

module.exports = function() {

  function day() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function parseSeason(data, intrest, name) {
    var season          = [0,0,0,0,0,0,0,0,0,0,0,0],
        totalSeasonDays = 0,
        inSeasonDays    = 0,
        today           = new Date(),
        key             = 1000;

    _.each(data, function(d) {
      var year = new Date(today.getFullYear(), 0);
      var date = new Date(year.setDate(d));

      if (date.getTime() < today.getTime()) inSeasonDays++;
      totalSeasonDays++;

      season[date.getMonth()]++;
    });

    if (intrest && intrest.length > 0)
      key = inSeasonDays * 2 + totalSeasonDays - intrest[0] * 50;

    return {
      season: season,
      key: key
    };

  }

  function parse(data) {
    data = _.filter(data, function(obj) { return obj.fulltext.indexOf('Special:') == -1; });

    var values = _.map(data, function(obj) {
      var newObj = {};

      newObj.name = (obj.fulltext.indexOf("Recept:") != -1) ? obj.fulltext.substring(7) : obj.fulltext;
      if (obj.printouts.Bild[0])
        newObj.image = obj.printouts.Bild[0].fulltext;

      newObj.category = obj.printouts.Kategori[0].fulltext.substring(9);

      newObj = _.extend(newObj, parseSeason(obj.printouts['Har säsong den'], obj.printouts.Intresse, newObj.name));

      return newObj;
    });

    return values;
  }

  function fetchThumbnail(image, promise) {

    if (!image || image == "Fil:Recept ikon sasongsmat.png") {
      promise.resolve(null);
      return;
    }

    var queryParams = {
      prop: 'imageinfo',
      titles: image,
      iiprop: 'url',
      iiurlwidth: 120
    };

    smw.mwQuery(queryParams, function(error, response) {
      var thumb = _.values(response.query.pages)[0].imageinfo[0].thumburl;
      promise.resolve(thumb);
    });
  }

  function loadSSMData(category, cb) {

    var smwQueryParams = {
      category: category,
      properties: [
        {
          key: 'Har säsong den',
          val: day()
        }
      ],
      printouts: [
        'Kategori',
        'Bild',
        'Intresse',
        'Har säsong den'
      ],
      limit: 500
    };

    smw.smwQuery({smwQueryParams: smwQueryParams}, function(error, response) {
      console.log("Got SMW Result");
      var values = parse(response.query.results);
      values.sort(function(a, b) { return a.key - b.key; });

      // process each object and synchronize the result
      // (i.e. wait for all to finish - multiple async calls)
      // TODO: fetch the actual articles here too?
      async.map(values, function(val, finished) {
        var imagePromise = new promise.Promise();
        var renderPromise = new promise.Promise();

        fetchThumbnail(val.image, imagePromise);
        renderer.render(val.season, renderPromise);

        promise.all([renderPromise, imagePromise]).then(function(result) {
          val.s1 = result[0];
          val.thumb = result[1];
          finished(null, val);
        });
      }, cb); // cb follows the (err, results) convention so just forward the reuslt to the caller
    });

  }

  this.articles = function(cb) {
    loadSSMData('Råvaror', function(err, result) {
      if (err) cb(err, result);
      else {
        fileutils.save('ssm_mobile_articles', JSON.stringify(result));
        cb(err, result);
      }
    });
  };

  this.recipes = function(cb) {
    loadSSMData('Recept', function(err, result) {
      if (err) cb(err, result);
      else {
        fileutils.save('ssm_mobile_recipes', JSON.stringify(result));
        cb(err, result);
      }
    });
  };

  this.latest = function(file) {
    return JSON.parse(fileutils.read(file));
  };

  this.latestArticles = function() {
    return JSON.parse(fileutils.read('ssm_mobile_articles'));
  };

  this.latestRecipes = function() {
    return JSON.parse(fileutils.read('ssm_mobile_recipes'));
  };

  this.purge = function() {
    fileutils.unlink('ssm_mobile_recipes');
    fileutils.unlink('ssm_mobile_articles');
  }

  return this;
}();

