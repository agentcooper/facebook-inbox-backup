// https://tech.yandex.ru/mystem/doc/index-docpage/

var sync = require('child_process').spawnSync;

var spawn = require('child_process').spawn;

function get(obj, callback) {
	var mystem = sync('./bin/mystem', ['-n', '-i', '-g', '--format=json'], { input: obj.input + '\n\r' });

	var output = mystem.stdout.toString().split('\n').filter(Boolean).map(function(line) {
		return JSON.parse(line);
	});

	output.forEach(function(item) {
		var analysis = item && item.analysis && item.analysis[0];

		if (analysis) {
			var match = analysis.gr && analysis.gr.match(/([A-Z]+)/);

			item.type = match && match[1];

			item.lex = analysis.lex;
		}
	});

	callback(null, output);
}

module.exports = {
	get: get
};
