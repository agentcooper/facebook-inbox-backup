var App = require('./app');

window.fbAsyncInit = function() {
  var appId = document.location.hash.slice(1) || '408463579315425';

  FB.init({
    appId: appId,
    version: 'v2.1'
  });

  App.init();

  FB.login(function() {
    App.getThreads();
  }, { scope: 'read_mailbox' });
};
