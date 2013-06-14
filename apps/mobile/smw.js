var request = require('request'),
    _       = require('underscore');

var smw = module.exports = {};

var ssmURL = "http://xn--ssongsmat-v2a.nu/w/api.php";

var smwQueryParams = {
  action: 'ask',
  format: 'json'
};

var mwQueryParams = {
  action: 'query',
  format: 'json'
};

function buildSMWQuery(params) {
  var query = "";

  query += "[[Category:" + params.category + "]]";

  query += _.reduce(params.properties, function(memo, prop) { return memo + "[[" + prop.key + "::" + prop.val + "]]"; }, " ");
  query += _.reduce(params.printouts, function(memo, prop) { return memo + "|?" + prop; }, "");
  query += "|limit=" + params.limit;

  return query;
}

function perform(query, cb) {
  var opts = {
    url: ssmURL,
    qs: query
  };

  request(opts, function(error, response, body) {
    if (response.headers['mediawiki-api-error'] !== undefined) {
      cb({
        error: response.headers['mediawiki-api-error'],
        info: response.body
      }, null);
    }
    else {
      cb(null, JSON.parse(body));
    }
  });
}

smw.smwQuery = function(params, cb) {
  var query = _.extend({ query: buildSMWQuery(params.smwQueryParams) }, smwQueryParams);
  console.log("Fetching SMW query: ", query);
  perform(query, cb);
};

smw.mwQuery = function(params, cb) {
  var query = _.extend(params, mwQueryParams);
  perform(query, cb);
};
