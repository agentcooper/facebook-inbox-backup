// //
//   <!-- // <script type='text/javascript' src='https://www.google.com/jsapi'></script>
//   // <script src="timeline.js"></script> -->
//
// (function() {
//
// 'use strict';
//
// google.load('visualization', '1', { packages: ['annotatedtimeline'] });
//
// function createArray(length, initial) {
//   var out = [];
//
//   for (var i = 0; i < length; i++) {
//     out.push(initial);
//   }
//
//   return out;
// }
//
// function buildKey(date) {
//   return [date.getDate(), date.getMonth(), date.getFullYear()].join('-');
// }
//
// function dateFromKey(key) {
//   var parts = key.split('-');
//   return new Date(parts[2], parts[1], parts[0]);
// }
//
// function drawThread(thread_ids) {
//   var data = new google.visualization.DataTable();
//   data.addColumn('date', 'Date');
//
//   var hash = {};
//
//   var threads = thread_ids.map(function(thread_id) {
//     return JSON.parse(localStorage.getItem('thread_' + thread_id));
//   });
//
//   // find a better way
//   var min = threads[0][0].created_time;
//
//   var now = new Date(Date.now());
//   for (var date = new Date(min); date <= now; date.setDate(date.getDate() + 1)) {
//       var key = buildKey(date);
//
//       if (!hash[key]) {
//         hash[key] = createArray(thread_ids.length, 0);
//       }
//   }
//
//   thread_ids.forEach(function(thread_id, index) {
//     var thread = App._threadById['thread_' + thread_id];
//
//     data.addColumn('number', App._getNames(thread));
//
//     var messages = JSON.parse(localStorage.getItem('thread_' + thread_id));
//
//     messages.forEach(function(message) {
//       var date = new Date(message.created_time);
//
//       hash[buildKey(date)][index] += 1;
//     });
//   });
//
//   var rows = [];
//
//   for (var key in hash) {
//     rows.push(
//       [dateFromKey(key)].concat(hash[key])
//     );
//   }
//
//   data.addRows(rows);
//
//   var chart = new google.visualization.AnnotatedTimeLine(
//     document.querySelector('.js-chart')
//   );
//   chart.draw(data, { displayAnnotations: true });
// }
//
// window.drawThread = drawThread;
//
// })();
