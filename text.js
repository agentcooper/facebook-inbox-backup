// https://tech.yandex.ru/mystem/doc/index-docpage/

// @TODO: download mystem after npm install

var sync = require('child_process').spawnSync;

var spawn = require('child_process').spawn;

var mystem = spawn('./mystem', ['-n', '-i', '-g', '--format=json']);

function get(obj, callback) {
	var mystem = sync('./mystem', ['-n', '-i', '-g', '--format=json'], { input: obj.input + '\n\r' });

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

// mystem.stdout.on('data', function(data) {
// 	var output = data.toString().split('\n').filter(Boolean).map(function(line) {
// 		return JSON.parse(line);
// 	});

// 	_callback(null, output);
// });

// function get(obj, callback) {
// 	_callback = callback;

// 	mystem.stdin.write(obj.input + '\r\n');
// }

// get({ input: 'артем любит есть вкусную черешню' }, function(err, res) {
// 	console.log(res);
// });

module.exports = {
	get: get
};
