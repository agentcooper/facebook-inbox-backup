var express = require('express');

var bodyParser = require('body-parser');

var browserify = require('browserify-middleware');

var babelify = require('babelify');

var app = express();

var getMostUsedWords = require('./compute');

app.use(express.static('public'));

app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json

app.get('/build.js', browserify('./public/main.js', { transform: ['babelify'] }));

app.post('/api/words', function(req, res) {
  var messages = JSON.parse(req.body.messages);

  getMostUsedWords({ messages: messages }, function(err, words) {
    return res.json({ words: words });
  });
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
