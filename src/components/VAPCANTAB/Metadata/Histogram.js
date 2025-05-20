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

    vis.parentRect = vis.parent.getBoundingClientRect();

    var width = vis.parentRect.width - margin.left - margin.right;
    var height = vis.parentRect.height - margin.top - margin.bottom;

    const x = d3.scaleBand().paddingInner(0.1).domain(names).range([0, width]);

    var chart = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    chart
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + height + ')')
      .call(d3.axisBottom(x))
      .style('font-size', '16px'); // Aumentar el tamaño de los ticks del eje X

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(totals)]);

    // Eje Y con mayor tamaño de ticks
    chart
      .append('g')
      .call(d3.axisLeft(y).ticks(d3.max(totals)))
      .style('font-size', '16px');

    chart
      .selectAll('.rect')
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
      .style('fill', '#1677ffe5');

    const tooltip = d3
      .select(vis.parent.parentElement)
      .append('div')
      .attr('class', 'myHistogramTooltip');
    const showTooltip = function (e, d) {
      tooltip.html('Total: ' + d.total + ' participants<br>Label: ' + d.description);
    };
    const moveTooltip = (e, d) => {
      tooltip
        .style('display', 'flex')
        .style('left', `${e.layerX}px`)
        .style('top', `${e.layerY - 60}px`);
    };

    const hideTooltip = function (e, d) {
      tooltip.style('display', 'none');
    };

    chart
      .selectAll('rect')
      .on('mouseover', showTooltip)
      .on('mousemove', moveTooltip)
      .on('mouseleave', hideTooltip);
  }
}
