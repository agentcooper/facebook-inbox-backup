var request = require('superagent');

var words = require('./words');

module.exports = {
  threads: {},

  timeout: 1000,

  // in reality, 30 is the maximum
  limit: 50,

  retryTimeout: 30000,

  currentThread: null,

  threadsData: [],

  init: function() {
    try {
      Array.prototype.push.apply(
        this.threadsData,
        JSON.parse(localStorage.getItem('threadsData'))
      );

      this._threadById = this.threadsData.reduce(function(hash, thread) {
        hash['thread_' + thread.id] = thread;

        return hash;
      }, {});
    } catch(e) {}

    this.updateUI();

    for (var selector in this.clicks) {
      document.querySelector(selector)
        .addEventListener('click', this.clicks[selector].bind(this));
    }
  },

  thread: function(thread_id) {
    if (typeof thread_id !== 'undefined') {
      this.currentThread = thread_id;
    }

    return this.currentThread;
  },

  getThreads: function() {
    var that = this;

    if (this.threadsData.length !== 0) {
      return;
    }

    FB.api('/me/inbox', function(res) {
      that.threadsData.length = 0;
      Array.prototype.push.apply(that.threadsData, res.data);
      localStorage.setItem('threadsData', JSON.stringify(that.threadsData));

      that.updateUI();
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

    var KEY = 'thread_' + thread_id;

    this.threads[thread_id] = this.threads[thread_id] || [];

    var messages = this.threads[thread_id];

    try {
      messages = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch(e) {
      messages = [];
    }

    (function step() {
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

        localStorage.setItem('thread_' + thread_id, JSON.stringify(that._clean(messages)));

        callbackEach(res, thread_id);

        return setTimeout(step, that.timeout);
      });

    })();
  },

  _getNames: (thread) => {
    return thread.to.data.map(item => item.name).join(' & ');
  },

  storedMessages: (id) => {
    return localStorage.getItem('thread_' + id);
  },

  updateUI: function() {
    var that = this;

    var html = '';

    html += this.threadsData.map(function(thread) {
      var names = '';

      var isSelected = '';

      var messages = [];

      try {
        var parsed = JSON.parse(localStorage.getItem('thread_' + thread.id));

        if (Array.isArray(parsed)) {
          messages = parsed;
        }

      } catch(e) {
        messages = [];
      }

      if (thread.id === that.currentThread) {
        isSelected = ' selected';
      }

      return `<option value=${thread.id}` + isSelected +
        `>${that._getNames(thread)}: ${messages.length} messages</option>`;
    }).join('');

    document.querySelector('.js-threads-list').innerHTML = html;
  },

  selectedThreadId: function() {
    return document.querySelector('.js-threads-list').value;
  },

  clicks: {
    '.js-flush': function() {
      document.write(localStorage.getItem('thread_' + this.selectedThreadId()));
    },

    '.js-remove': function() {
      localStorage.removeItem('thread_' + this.selectedThreadId());

      this.updateUI();
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
      drawThread([this.selectedThreadId(), '1499118800308205']);
    },

    '.js-draw-chart-words': function() {
      request
      .post('/api/words')
      .set('Accept', 'application/json')
      .send({
        messages: this.storedMessages(this.selectedThreadId())
      }).end(function(err, res) {
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
    }
  }
};
