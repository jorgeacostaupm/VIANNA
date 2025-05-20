import * as d3 from 'd3';
import store from '@/components/VAPUtils/features/store';
import './styles.css';

const X_LEGEND = 0.8;

export class D3DistributionCategoriesPlots {
  constructor(parent, data) {
    this.parent = parent;
    this.margin = { top: 50, right: 20, bottom: 70, left: 80 };
    this.data = data;
    this.color_scheme = d3.schemeCategory10;
    this.legend_points_size = 15;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append('g')
      .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3.select('#lines-tooltip').attr('class', 'tooltip');
    vis.x_axis_g = vis.chart.append('g').attr('class', 'x-axis');
    vis.y_axis_g = vis.chart.append('g').attr('class', 'y-axis');
    vis.legend_svg = d3.select('#compare-lines-legend');

    vis.setSize();
  }

  setSize() {
    let vis = this;
    vis.parentRect = vis.parent.getBoundingClientRect();
    vis.total_width = 1880;
    vis.width = 1880 - vis.margin.left - vis.margin.right;
    vis.height = 370 - vis.margin.top - vis.margin.bottom;
    vis.x_axis_g.attr('transform', `translate(0, ${vis.height})`);
  }

  onResize(dimensions) {
    let vis = this;
    const { width, height } = dimensions;
    vis.total_width = width;
    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;
    vis.x_axis_g.attr('transform', `translate(0, ${vis.height})`);
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.group_var = store.getState().cantab.group_var;
    vis.selected_var = store.getState().compare.selected_var;
    vis.populations = store.getState().cantab.selection_populations;
    vis.groups = store.getState().cantab.populations;
    vis.populationVariable = store.getState().cantab.group_var;

    vis.filtered_data = vis.data.slice(0, vis.n_bars);

    const all_values = vis.data.map((d) => +d.count);
    const y_max = Math.max(...all_values);

    vis.data = vis.data.filter((d) => {
      return d[vis.group_var] != null && d[vis.selected_var] != null;
    });

    vis.populations = vis.populations.filter((d) => d != null);

    vis.categories = [...new Set(vis.data.map((d) => d[vis.selected_var]))].sort();

    vis.x_scale = d3.scaleBand().range([0, vis.width]).domain(vis.categories).padding(0.2);

    vis.x_sub_scale = d3
      .scaleBand()
      .range([0, vis.x_scale.bandwidth()])
      .domain(vis.data.map((d) => d[vis.group_var]))
      .padding(0.2);

    vis.y_scale = d3.scaleLinear().domain([0, y_max]).range([vis.height, 0]);

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.color_scheme);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    console.log('data', vis.data);

    vis.chart
      .selectAll('.bar')
      .data(vis.data)
      .join('rect')
      .attr('class', (d) => 'bar ' + d[vis.group_var])
      .attr('group', (d) => d[vis.group_var])
      .attr('x', (d) => vis.x_scale(d[vis.selected_var]) + vis.x_sub_scale(d[vis.group_var]))
      .attr('y', (d) => vis.y_scale(d.count))
      .attr('width', vis.x_sub_scale.bandwidth())
      .attr('height', (d) => vis.height - vis.y_scale(d.count))
      .attr('fill', (d) => vis.color(d[vis.group_var]))
      .on('mouseover', function (e, d) {
        vis.tooltip.style('opacity', 1).html(
          `${vis.group_var}: ${d[vis.group_var]} <br>
          Total: ${d.count} `
        );
      })
      .on('mousemove', function (e, d) {
        const [x, y] = d3.pointer(e);
        vis.tooltip
          .style('opacity', 1)
          .style('left', `${x}px`)
          .style('top', `${y - 70}px`);
      })
      .on('mouseout', function () {
        vis.tooltip.style('opacity', 0);
      });

    vis.legend_svg.node().innerHTML = '';
    vis.myLegend = vis.legend_svg;

    vis.myLegend
      .selectAll('.populationVariable')
      .data([vis.populationVariable])
      .join('text')
      .attr('class', 'populationVariable')
      .classed('not_selected', false)
      .attr('x', 0)
      .attr('y', 20)
      .text((d) => 'Group Variable: ' + d);

    vis.myLegend
      .selectAll('.legend-circle')
      .data(vis.populations)
      .join('circle')
      .attr('class', 'legend-circle')
      .attr('cx', 70)
      .attr('cy', (d, i) => 61 + 45 * i)
      .attr('r', 15)
      .style('fill', (d) => vis.color(d))
      .attr('path', (d) => 'path' + d);

    vis.myLegend
      .selectAll('.legend')
      .data(vis.populations)
      .join('text')
      .attr('class', 'legend')
      .classed('not_selected', false)
      .attr('x', 70 + vis.legend_points_size + 10)
      .attr('y', (d, i) => 65 + 45 * i)
      .text((d) => d)
      .style('cursor', 'pointer')
      .attr('alignment-baseline', 'middle')
      .attr('path', (d) => 'path' + d)
      .on('mouseover', function (e, d) {
        console.log(d);
        vis.chart
          .selectAll('.bar')
          .filter((bar) => {
            return bar[vis.group_var] !== d;
          })
          .style('opacity', 0.1);
      })
      .on('mouseout', function () {
        vis.chart.selectAll('.bar').style('opacity', 1);
      })
      .on('click', (e, d) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(d);

        const item = d3.select(e.target);
        const is_selected = item.classed('not_selected');

        const path = d3.selectAll('.' + d);
        item.classed('not_selected', !is_selected);
        path.classed('not_show', !is_selected);
      });

    function updateSvgSize() {
      const bbox = vis.legend_svg.node().getBBox();
      vis.legend_svg.attr('height', bbox.height + bbox.y + 20);
    }

    updateSvgSize();

    vis.chart
      .selectAll('.yAxisLabel')
      .data([null])
      .join('text')
      .attr('class', 'yAxisLabel')
      .attr('transform', `translate(-70,${-30})rotate(0)`)
      .attr('text-anchor', 'start')
      .text('Nº Items (' + vis.selected_var + ')');

    vis.x_axis_g.call(d3.axisBottom(vis.x_scale));

    vis.y_axis_g.call(d3.axisLeft(vis.y_scale).tickFormat(d3.format('d')));

    vis.y_axis_g
      .selectAll('.tick')
      .filter((d) => d % 1 !== 0)
      .remove();
  }
}
