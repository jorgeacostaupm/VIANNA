import * as d3 from 'd3';

export class Histogram {
  data;
  parent;
  margin;
  constructor(parent, data) {
    this.parent = parent;
    this.data = data;
    this.initVis();
  }

  initVis() {
    let vis = this;
    var svg = d3.select(vis.parent);

    var margin = { top: 30, right: 0, bottom: 30, left: 40 };

    const data = this.data;
    const x_accesor = (d) => d.name;
    const names = data.map((d) => x_accesor(d));
    const totals = data.map((d) => d.total);

    const tooltip = d3.select(vis.parent.parentElement).append('div').attr('class', 'tooltip');

    var width = 1200 - margin.left - margin.right;
    var height = 150 - margin.top - margin.bottom;

    // X axis: scale and draw:
    const x = d3
      .scaleBand()
      .paddingInner(0.1)
      .domain(names) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);

    var chart = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    chart
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + height + ')')
      .call(d3.axisBottom(x));

    // Y axis: scale and draw:
    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(totals)]); // d3.hist has to be called before the Y axis obviously
    chart.append('g').call(d3.axisLeft(y).ticks(d3.max(totals)));

    // append the bar rectangles to the svg element
    chart
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', 1)
      .attr('transform', function (d) {
        return `translate(${x(x_accesor(d))} , ${y(d.total)})`;
      })
      .attr('width', function (d) {
        return x.bandwidth();
      })
      .attr('height', function (d) {
        return height - y(d.total);
      })
      .style('fill', '#69b3a2');

    const showTooltip = function (e, d) {
      tooltip.transition().duration(100).style('opacity', 1);
      tooltip.html(d.total + ' subjects ' + d.description);
    };
    const moveTooltip = function (e, d) {
      tooltip.transition().duration(100).style('opacity', 1);
      const [x, y] = d3.pointer(e, svg.node());
      tooltip.style('display', 'flex').style('left', `${x}px`).style('top', `${y}px`);
    };
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const hideTooltip = function (e, d) {
      tooltip.transition().duration(100).style('opacity', 0);
    };

    chart
      .selectAll('rect')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseleave', hideTooltip);
  }
}
