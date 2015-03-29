var request = require('superagent');

var words = require('./words');

var storage = require('localforage');

var timeline = require('./timeline');

window.storage = storage;

var async = require('async');

module.exports = {
  threads: {},

  timeout: 1000,

  // in reality, 30 is the maximum
  limit: 50,

  retryTimeout: 30000,

  currentThread: null,

  threadsData: [],

  init: function() {
    var that = this;

    storage.getItem('threadsData', function(err, threadsData) {
      Array.prototype.push.apply(
        that.threadsData,
        threadsData || []
      );

      that._threadById = that.threadsData.reduce(function(hash, thread) {
        hash['thread_' + thread.id] = thread;

        return hash;
      }, {});

      that.updateUI();

      for (var selector in that.clicks) {
        document.querySelector(selector)
          .addEventListener('click', that.clicks[selector].bind(that));
      }
    });
  },

  thread: function(thread_id) {
    if (typeof thread_id !== 'undefined') {
      this.currentThread = thread_id;
    }

    return this.currentThread;
  },

  getThreads: function() {
    var that = this;

    storage.getItem('threadsData', function(err, threadsData) {
      if (threadsData) {
        return;
      }

      FB.api('/me/inbox', function(res) {
        that.threadsData.length = 0;
        Array.prototype.push.apply(that.threadsData, res.data);

        storage.setItem('threadsData', that.threadsData, function() {
          that.updateUI();
        });
      });

    });
  },

  _clean: function(messages) {
    messages.forEach((message) => {
      delete message.from;
    });

    return messages;
  },

  getPreviousMessages: function(thread_id, callbackEach, callbackDone) {
    var that = this;

    // need to provide old datetime
    var BEFORE = '2004-03-20T14:14:18+0000';

    this.threads[thread_id] = this.threads[thread_id] || [];

    var messages = this.threads[thread_id];

    this.storedMessages(thread_id, function(err, value) {
      messages = value || [];

      step();
    });

    function step() {
      var fields = 'comments';

      if (messages.length > 0) {
        fields = fields + '.since(' + BEFORE + ').until(' +
          messages[0].created_time + ').limit(' + that.limit + ')';
      }

      FB.api('/' + that.currentThread, {
        fields: fields
      }, function(res) {
        if (res.error) {
          console.error(res.error);

          // rate limit exceeded
          if (res.error.code === 613) {
            that.retryTimeout += 5000;

            console.log('Retrying in %s ms', that.retryTimeout);

            return setTimeout(step, that.retryTimeout);
          }
        }

        if (messages.length > 0 &&
          res.comments.data[res.comments.data.length - 1].id === messages[0].id) {

          if (res.comments.data.length === 1) {
            return callbackDone(null, messages);
          }

          Array.prototype.unshift.apply(messages, res.comments.data.slice(0, -1));
        } else {
          Array.prototype.unshift.apply(messages, res.comments.data);
        }

        storage.setItem('thread_' + thread_id, that._clean(messages), function() {
          callbackEach(res, thread_id);

          return setTimeout(step, that.timeout);
        });
      });

    };
  },

  _getNames: (thread) => {
    return thread.to.data.map(item => item.name).join(' & ');
  },

  storedMessages: (id, callback) => {
    return storage.getItem('thread_' + id, callback);
  },

  updateUI: function() {
    var that = this;

    var html = '';

    async.map(this.threadsData, function(thread, callback) {
      that.storedMessages(thread.id, function(err, messages) {
        var names = '';

        var isSelected = '';

        var messages = messages || [];

        if (thread.id === that.currentThread) {
          isSelected = ' selected';
        }

        callback(
          null,
          `<option value=${thread.id}` + isSelected +
            `>${that._getNames(thread)}: ${messages.length} messages</option>`
        );
      })
    }, function(err, res) {
      document.querySelector('.js-threads-list').innerHTML = res.join('');
    })
  },

  selectedThreadId: function() {
    return document.querySelector('.js-threads-list').value;
  },

  clicks: {
    '.js-flush': function() {
      this.storedMessages(this.selectedThreadId(), function(err, messages) {
        document.write(JSON.stringify(messages));
      });
    },

    '.js-remove': function() {
      storage.removeItem('thread_' + this.selectedThreadId(), function(err) {
        this.updateUI();
      })
    },

    '.js-get-messages': function() {
      var that = this;

      console.log('Started');

      this.thread(this.selectedThreadId());

      this.getPreviousMessages(this.thread(), function(res) {
        console.log('Got %s messages', res.comments.data.length);

        that.updateUI();
      }, function(err, messages) {
        console.log('Done', messages);

        alert('Done!');
      });
    },

    '.js-draw-chart': function() {
      timeline.render(this, [this.selectedThreadId()]);
    },

    '.js-draw-chart-words': function() {
      this.storedMessages(this.selectedThreadId(), function(err, messages) {
        request
          .post('/api/words')
          .send({ messages: messages })
          .end(function(err, res) {
            var words = res.body.words;

            var html = '';

            html += '<ol>';

            html += words.map(item => {
              return '<li>' + item.word + ': ' + item.count + '</li>';
            }).join('');

            html += '</ol>';

            document.querySelector('.js-messages-list').innerHTML = html;

            // words.render(res.body.words);
          });
      });
    }
  }
};
