import * as d3 from 'd3';
import store from '@/components/VAPUtils/features/store';
import './styles.css';
import {
  addFilteringVariable,
  setSelectedVar
} from '@/components/VAPUtils/features/compare/compareSlice';
import { moveTooltip } from '@/components/VAPUtils/functions';

export class D3ComparisonBarplot {
  constructor(parent) {
    this.parent = parent;
    this.margin = { top: 50, right: 80, bottom: 50, left: 80 };
    this.nBars = 15;
    this.desc = true;
    this.filterList = [];
    this.xAccesor = (d) => d.variable;
    this.yAccesor = (d) => Math.abs(+d.value);
    this.addFilteringVariable = addFilteringVariable;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append('g')
      .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

    vis.tooltip = d3.select('#tooltip').attr('class', 'tooltip infoTooltip');
    vis.descTooltip = d3.select('#description-tooltip').attr('class', 'tooltip descTooltip');
    vis.xAxisG = vis.chart.append('g').attr('class', 'x-axis');
    vis.yAxisG = vis.chart.append('g').attr('class', 'y-axis');

    const dimensions = vis.parent.getBoundingClientRect();
    vis.setSize(dimensions);
  }

  setSize(dimensions) {
    let vis = this;
    const { width, height } = dimensions;
    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;
    vis.xAxisG.attr('transform', `translate(0, ${vis.height})`);
  }

  onResize(dimensions) {
    let vis = this;
    vis.setSize(dimensions);
    vis.updateVis();
  }

  renderNoData() {
    const vis = this;
    const xAxisGroup = vis.xAxisG;
    const yAxisGroup = vis.yAxisG;

    vis.chart.selectAll('*').remove();

    vis.chart.append(() => xAxisGroup.node());
    vis.chart.append(() => yAxisGroup.node());
  }

  updateVis() {
    let vis = this;

    if (vis.data.length === 0) {
      vis.renderNoData();
      return;
    }

    vis.data = vis.data.filter((d) => !vis.filterList.includes(d.variable));
    vis.selectedVar = store.getState().compare.selectedVar;

    vis.loaded_descriptions = store.getState().cantab.descriptions;
    vis.descriptions = {};
    store.getState().metadata.attributes.forEach((attr) => {
      if (attr.desc != '') vis.descriptions[attr.name] = attr.desc;
      if (vis.loaded_descriptions[attr.name])
        vis.descriptions[attr.name] = vis.loaded_descriptions[attr.name];
    });

    vis.data.sort((b, a) => {
      return vis.desc ? asc(a, b, vis.yAccesor) : desc(a, b, vis.yAccesor);
    });

    vis.filteredData = vis.data.slice(0, vis.nBars);

    const all_values = vis.filteredData.map((d) => Math.abs(+d.value));
    const y_max = Math.max(...all_values);

    vis.x_scale = d3
      .scaleBand()
      .range([0, vis.width])
      .domain(vis.filteredData.map((d) => vis.xAccesor(d)))
      .padding(0.2);

    vis.y_scale = d3.scaleLinear().domain([0, y_max]).range([vis.height, 0]);

    vis.selectedBar = null;

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    console.log('RENDERING COMPARE BARCHART');

    vis.chart
      .selectAll('.bar')
      .data(vis.filteredData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => vis.x_scale(vis.xAccesor(d)))
      .attr('y', (d) => vis.y_scale(vis.yAccesor(d)))
      .attr('width', vis.x_scale.bandwidth())
      .attr('height', (d) => vis.height - vis.y_scale(vis.yAccesor(d)))
      .attr('fill', 'rgb(22, 119, 255)')
      .on('mouseover', function (e, d) {
        vis.tooltip.style('opacity', 1).html(
          `Measure: ${vis.xAccesor(d)} <br>
          ${vis.measure}: ${vis.yAccesor(d).toFixed(3)} <br>
          p-value: ${d.p_value.toFixed(3)} `
        );
      })
      .on('mousemove', function (e, d) {
        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on('mouseout', function () {
        vis.tooltip.style('opacity', 0);
      })
      .on('click', function (e, d) {
        const clickedBar = d3.select(this);

        if (vis.selectedBar && clickedBar.node() === vis.selectedBar.node()) {
          clickedBar.attr('class', 'bar');
          vis.selectedBar = null;
        } else {
          if (vis.selectedBar) {
            vis.selectedBar.attr('class', 'bar');
          }

          vis.selectedBar = clickedBar;

          vis.selectedBar.attr('class', 'bar selected');
        }
        store.dispatch(setSelectedVar(vis.selectedBar ? d.variable : null));
      });

    let tmp = vis.chart.selectAll('.bar').filter((d) => d.variable === vis.selectedVar);
    if (tmp) {
      tmp.attr('class', 'bar selected');
      vis.selectedBar = tmp;
    }

    vis.chart.selectAll('.bar').classed('selected', function (d) {
      if (d.variable === vis.selectedVar) vis.selectedBar = d3.select(this);
      return d.variable === vis.selectedVar;
    });

    vis.chart
      .selectAll('.yAxisLabel')
      .data([null])
      .join('text')
      .attr('class', 'yAxisLabel')
      .attr('transform', `translate(-0,${-15})rotate(0)`)
      .attr('text-anchor', 'middle')
      .text(vis.measure);

    vis.xAxisG
      .call(d3.axisBottom(vis.x_scale))
      .selectAll('text')
      .attr('transform', 'translate(0,0)rotate(-15)')
      .style('text-anchor', 'end');

    vis.xAxisG
      .selectAll('.tick')
      .on('click', (e, d) => {
        if (d === vis.selectedVar) store.dispatch(setSelectedVar(null));
        store.dispatch(vis.addFilteringVariable(d));
      })
      .on('mouseover', function (e, d) {
        const description = vis.descriptions[d] ? vis.descriptions[d] : 'No description available';
        vis.descTooltip.style('opacity', 1).html(`Description: ${description} `);
      })
      .on('mousemove', function (e, d) {
        moveTooltip(e, vis.descTooltip, vis.chart);
      })
      .on('mouseout', function () {
        vis.descTooltip.style('opacity', 0);
      });

    vis.yAxisG.call(d3.axisLeft(vis.y_scale));
  }
}

function asc(a, b, accesor) {
  return Math.abs(accesor(a)) - Math.abs(accesor(b));
}

function desc(a, b, accesor) {
  return Math.abs(accesor(b)) - Math.abs(accesor(a));
}
