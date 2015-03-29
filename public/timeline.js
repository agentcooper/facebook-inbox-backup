var storage = require('localforage');

var async = require('async');

function addScript(src, callback) {
  var s = document.createElement('script');
  s.setAttribute('src', src);
  s.onload = callback;
  document.body.appendChild(s);
}

function createArray(length, initial) {
  var out = [];

  for (var i = 0; i < length; i++) {
    out.push(initial);
  }

  return out;
}

function buildKey(date) {
  return [date.getDate(), date.getMonth(), date.getFullYear()].join('-');
}

function dateFromKey(key) {
  var parts = key.split('-');
  return new Date(parts[2], parts[1], parts[0]);
}

function drawThread(App, thread_ids) {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');

  var hash = {};

  async.map(thread_ids, function(thread_id, callback) {

    storage.getItem('thread_' + thread_id, function(err, messages) {
      var threadData = App._threadById['thread_' + thread_id];

      callback(err, {
        thread_id: thread_id,
        messages: messages,
        names: App._getNames(threadData)
      });
    });

  }, function(err, threads) {
    // find a better way
    var min = threads[0].messages[0].created_time;

    var now = new Date(Date.now());
    for (var date = new Date(min); date <= now; date.setDate(date.getDate() + 1)) {
        var key = buildKey(date);

        if (!hash[key]) {
          hash[key] = createArray(thread_ids.length, 0);
        }
    }

    threads.forEach(function(thread, index) {
      data.addColumn('number', thread.names);

      thread.messages.forEach(function(message) {
        var date = new Date(message.created_time);

        hash[buildKey(date)][index] += 1;
      });
    });

    var rows = [];

    for (var key in hash) {
      rows.push(
        [dateFromKey(key)].concat(hash[key])
      );
    }

    data.addRows(rows);

    var chart = new google.visualization.AnnotatedTimeLine(
      document.querySelector('.js-chart')
    );

    document.querySelector('.js-chart-wrapper').classList.remove('g-hidden');

    document.querySelector('.js-chart')
      .setAttribute('style', 'width: 900px; height: 350px;');

    chart.draw(data, { displayAnnotations: true });
  });
}

module.exports = {
  render: function(App, thread_ids) {
    var that = this;

    if (!this.init) {
      addScript('https://www.google.com/jsapi', function() {
        google.load('visualization', '1', {
          packages: ['annotatedtimeline'],

          callback: function() {
            that.init = true;

            drawThread(App, thread_ids);
          }
        });
      });
    } else {
      drawThread(App, thread_ids);
    }
  }
};
