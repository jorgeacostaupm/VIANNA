import * as d3 from 'd3';
import './styles.css';
import store from '@/components/VAPUtils/features/store';

export class D3EvolutionCategoric {
  constructor(parent, data) {
    this.parent = parent;
    this.data = data;
    this.margin = { top: 50, right: 20, bottom: 50, left: 80 };
    this.show_std = true;
    this.color_scheme = d3.schemeDark2;
    this.points_size = 15;
    this.stroke_width = 3;
    this.legend_points_size = 15;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append('g')
      .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3.select('#times-tooltip').attr('class', 'tooltip');

    vis.x_axis_g = vis.chart.append('g').attr('class', 'x-axis');
    vis.y_axis_g = vis.chart.append('g').attr('class', 'y-axis');
    vis.legend_svg = d3.select('#evolution-lines-legend');

    window.addEventListener('resize', () => {
      vis.setSize();
      vis.updateVis();
    });
    vis.setSize();
    vis.updateVis();
  }

  onResize(dimensions) {
    let vis = this;
    const { width, height } = dimensions;
    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;
    vis.total_width = width;
    vis.x_axis_g.attr('transform', `translate(0, ${vis.height})`);
    vis.updateVis();
  }

  setSize() {
    let vis = this;
    vis.parentRect = vis.parent.getBoundingClientRect();
    vis.width = vis.parentRect.width - vis.margin.left - vis.margin.right;
    vis.height = vis.parentRect.height - vis.margin.top - vis.margin.bottom;
    vis.total_width = vis.parentRect.width;
    vis.x_axis_g.attr('transform', `translate(0, ${vis.height})`);
  }

  updateVis() {
    let vis = this;
    vis.populations = vis.data.map((d) => d.population);
    vis.groups = vis.data.map((d) => d.population);
    vis.times = store.getState().cantab.times;
    vis.times = vis.times.map((t) => '' + t);
    vis.variable = store.getState().evolution.selected_var;

    /*vis.data = vis.data.splice(0, 4);

     for (let i = 1; i < 3 && i < vis.data.length; i++) {
      vis.data[i]["valueA"] = null;
    } */

    vis.dataReady = [];

    const sort_func = (a, b) => {
      return vis.times.indexOf(a.time) - vis.times.indexOf(b.time);
    };

    vis.data.forEach(function (grp, i) {
      const allTime = Object.keys(grp).filter((d) => d !== 'population');

      const items = allTime.map((time) => ({ time: time, value: grp[time] }));

      vis.dataReady.push({
        name: grp['population'],
        values: items.sort(sort_func),
        id: i
      });
    });

    const x_min = Math.min(...vis.times);
    const x_max = Math.max(...vis.times);
    const { y_min, y_max } = findMinAndMax(vis.data);

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.color_scheme);

    vis.x_scale = d3.scaleBand().range([0, vis.width]).domain(vis.times);

    vis.y_scale = d3
      .scaleLinear()
      .domain([0, Math.ceil(y_max * 1.1)])
      .range([vis.height, 0]);

    vis.line = d3
      .line()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y((d) => vis.y_scale(+d.value.mean));

    vis.area = d3
      .area()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y0((d) => vis.y_scale(+d.value.mean + +d.value.std))
      .y1((d) => vis.y_scale(+d.value.mean - +d.value.std));

    vis.selectedBar = null;

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart
      .selectAll('.myLines')
      .data(vis.dataReady)
      .join('path')
      .attr('class', (d) => `myLines t${d.id} item`)
      .attr('d', (d) => vis.line(d.values))
      .attr('stroke', (d) => vis.color(d.name))
      .style('stroke-width', vis.stroke_width)
      .style('fill', 'none');

    vis.chart
      .selectAll('.myAreas')
      .data(vis.dataReady)
      .join('path')
      .attr('class', (d) => `myAreas t${d.id}`)
      .attr('d', (d) => vis.area(d.values))
      .attr('fill', (d) => vis.color(d.name))
      .attr('opacity', 0.5)
      .style('stroke', 'none')
      .attr('display', vis.show_std ? 'inline' : 'none');

    vis.chart
      .selectAll('.myDots')
      .data(vis.dataReady)
      .join('g')
      .style('fill', (d) => vis.color(d.name))
      .attr('class', (d) => `myDots t${d.id} item`)
      .selectAll('.myPoints')
      .data((d) => d.values)
      .join('circle')
      .attr('class', 'myPoints')
      .attr('cx', (d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .attr('cy', (d) => vis.y_scale(d.value.mean))
      .attr('r', vis.points_size)
      .style('opacity', 0.8)
      .attr('stroke', 'white')
      .on('mouseover', function (event, d) {
        vis.tooltip.style('opacity', 1).html(`Nº Items: ${d.value.mean}`);
      })
      .on('mousemove', function (e, d) {
        console.log(this);
        const rect = this.getBoundingClientRect();
        console.log(rect, e);
        vis.tooltip
          .style('opacity', 1)
          .style('left', `${e.layerX}px`)
          .style('top', `${e.layerY - 35}px`);
      })
      .on('mouseout', function () {
        vis.tooltip.style('opacity', 0);
      })
      .on('click', function (event, d) {
        const clickedBar = d3.select(this);

        if (vis.selectedBar && clickedBar.node() === vis.selectedBar.node()) {
          clickedBar.attr('class', '').style('stroke', null).style('stroke-width', null);
          vis.selectedBar = null;
        } else {
          if (vis.selectedBar) {
            vis.selectedBar.attr('class', '').style('stroke', null).style('stroke-width', null);
          }

          vis.selectedBar = clickedBar;
          vis.selectedBar
            .attr('class', 'selected')
            .style('stroke', 'black')
            .style('stroke-width', '2px');
        }
      });
    vis.legend_svg.node().innerHTML = '';
    vis.myLegend = vis.legend_svg;

    vis.myLegend
      .selectAll('.populationVariable')
      .data([vis.variable?.split('^')[0]])
      .join('text')
      .attr('class', 'populationVariable')
      .classed('not_selected', false)
      .attr('x', 0)
      .attr('y', 15)
      .text((d) => 'Group Variable: ' + d);

    vis.myLegend
      .selectAll('.range')
      .data([null])
      .join('text')
      .attr('class', 'range')
      .attr('x', 0)
      .attr('y', 40)
      .text(``);

    vis.myLegend
      .selectAll('.legend-circle')
      .data(vis.dataReady)
      .join('circle')
      .attr('class', 'legend-circle')
      .attr('id', (d) => 'path' + d.id)
      .attr('cx', 90)
      .attr('cy', (d) => 71 + 45 * vis.populations.indexOf(d.name))
      .attr('r', 15)
      .style('fill', (d) => vis.color(d.name));

    vis.myLegend
      .selectAll('.legend')
      .data(vis.dataReady)
      .join('text')
      .attr('class', 'legend')
      .classed('not_selected', false)
      .attr('x', 90 + vis.legend_points_size + 10)
      .attr('y', (d) => 75 + 45 * vis.populations.indexOf(d.name))
      .text((d) => d.name)
      .style('cursor', 'pointer')
      .attr('alignment-baseline', 'middle')
      .attr('path', (d) => 'path' + d.name)
      .on('mouseover', function (e, d) {
        console.log(d);
        vis.chart
          .selectAll('.item')
          .filter((item) => {
            console.log(item);
            return item.id !== d.id;
          })
          .style('opacity', 0.1);
      })
      .on('mouseout', function () {
        vis.chart.selectAll('.item').style('opacity', 1);
      })
      .on('click', function (e, d) {
        e.preventDefault();
        e.stopPropagation();

        const item = d3.select(e.target);
        const is_selected = item.classed('not_selected');

        item.classed('not_selected', !is_selected);
        d3.selectAll('.t' + d.id).classed('not_show', !is_selected);
      });

    function updateSvgSize() {
      const bbox = vis.legend_svg.node().getBBox();
      console.log(bbox);
      vis.legend_svg.attr('height', bbox.height + bbox.y + 20);
    }

    updateSvgSize();

    vis.chart
      .selectAll('.yAxisLabel')
      .data([null]) // No necesitamos datos para una única etiqueta de eje.
      .join('text')
      .attr('class', 'yAxisLabel')
      .attr('transform', `translate(-70,${-30})rotate(0)`)
      .attr('text-anchor', 'start')
      .text('Nº Items (' + vis.variable?.split('^')[0] + ')');

    vis.x_axis_g.call(d3.axisBottom(vis.x_scale).tickValues(vis.times));
    vis.y_axis_g.call(d3.axisLeft(vis.y_scale).tickFormat(d3.format('d')));

    vis.y_axis_g
      .selectAll('.tick')
      .filter((d) => d % 1 !== 0)
      .remove();
  }
}

function findMinAndMax(data) {
  let y_min = Infinity;
  let y_max = -Infinity;

  data.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      // Ignorar la clave 'time'
      if (key !== 'time') {
        const numericValue = parseFloat(value.mean);
        if (numericValue < y_min) {
          y_min = numericValue;
        }
        if (numericValue > y_max) {
          y_max = numericValue;
        }
      }
    });
  });

  return { y_min, y_max };
}

function findMinAndMaxStd(data) {
  let y_min = Infinity;
  let y_max = -Infinity;

  data.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      // Ignorar la clave 'time'
      if (key !== 'time') {
        const numericValue = parseFloat(value.std);
        if (numericValue < y_min) {
          y_min = numericValue;
        }
        if (numericValue > y_max) {
          y_max = numericValue;
        }
      }
    });
  });

  return y_max;
}
