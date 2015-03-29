var program = require('commander');

var skype = require('./skype');

var getMostUsedWords = require('./getMostUsedWords');

program
  .version('0.0.1')
  .option('-p, --me [username]', 'Your skype username')
  .option('-p, --words [username]', 'Dialog to get messages for')
  .parse(process.argv);

if (!program.me) {
  return;
}

skype.init({ me: program.me });

if (program.words) {
  skype.getMessages(program.words, function(err, messages) {
    getMostUsedWords({ messages: messages }, function(err, words) {
      console.log({ words: words, messages_count: messages.length });
    });
  });

} else {
  skype.getChats(function(err, chats) {
    console.log(chats);
  });
}
