var sqlite3 = require('sqlite3').verbose();

module.exports = {
  db: null,

  init: function(params) {
    this.db = new sqlite3.Database(
      '/Users/atyurin/Library/Application Support/Skype/' + params.me + '/main.db'
    );
  },

  getChats: function(callback) {
    this.db.all("select DISTINCT dialog_partner,friendlyname from chats", function(err, chats) {
      callback(err, chats);
    });
  },

  getMessages: function(username, callback) {
    this.db.all("select timestamp,body_xml as message from messages where dialog_partner=\"" + username + "\";", function(err, messages) {
      callback(err, messages);
    });
  },

  close: function() {
    this.db.close();
  }
}
