var parser = require('./text');

function is(item, arr) {
    return item && arr.some(function(type) { return item.type === type; });
}

function compute(obj, callback) {
  var wordHash = {};

  var text = obj.messages.map(function(message) {
    return message.message;
  }).join('\n');

  parser.get({ input: text }, function(err, res) {

      var words = res.filter(function(item) {
          return is(item, ['S'])
      }).map(function(item) {
          return item.lex || item.text;
      });

      words.forEach(function(word) {

          if (wordHash[word]) {
              wordHash[word]++;
          } else {
              wordHash[word] = 1;
          }

      });

      var sorted = [];
      for (var word in wordHash) {
        sorted.push({ word: word, count: wordHash[word] });
      }
      sorted.sort(function(a, b) { return b.count - a.count; });

      var output = sorted.filter(function(item) {
        return item.word.length > 1 && item.count > 5;
      });

      callback(null, output);
  });
}

module.exports = compute;
