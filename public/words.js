var d3 = require('d3');

var diameter = 2000,
    format = d3.format(',d'),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

function render(root) {
  var svg = d3.select('body').append('svg')
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('class', 'bubble');

  var node = svg.selectAll('.node')
    .data(bubble.nodes(classes(root))
    .filter(function(d) { return !d.children; }))
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

  node.append('title')
    .text(function(d) { return d.className + ': ' + format(d.value); });

  node.append('circle')
    .attr('r', function(d) { return d.r; })
    .style('fill', function(d) { return color(d.packageName); })
    .on( 'mouseover', function() {
      d3.select(this.parentNode).select('text').text(function(d) { return String(d.value); });
    })
    .on('mouseout', function() {
      d3.select(this.parentNode).select('text').text(function(d) { return d.className; });
    });

  node.append('text')
    .attr('dy', '.3em')
    .style('text-anchor', 'middle')
    .style('font-size',function(d) { return Math.max(9, d.value / 5) + 'px'; })
    .text(function(d) { return d.className; });

  d3.select(self.frameElement).style('height', diameter + 'px');
}

function classes(root) {
  var children = root.filter(function(item) {
    return item.word.length > 3;
  }).map(function(item) {
    return {packageName: item.word, className: item.word, value: item.count}
  });

  return {
    children: children
  };
}

module.exports = {
  render: render
};
