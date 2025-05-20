import * as d3 from 'd3';
import store from '@/components/VAPUtils/features/store';
import { moveTooltip } from '@/components/VAPUtils/functions';
import './styles.css';
import {
  addFilteringVariable,
  setSelectedVar,
  setSelectedPopulation
} from '@/components/VAPUtils/features/evolution/evolutionSlice';

export class D3EvolutionBarplot {
  constructor(parent) {
    this.parent = parent;
    this.margin = { top: 50, right: 80, bottom: 80, left: 80 };
    this.nBars = 15;
    this.asc = true;
    this.filterList = [];
    this.xAccesor = (d) => d.variable + '^' + d.population;
    this.yAccesor = (d) => d.value;
    this.addFilteringVariable = addFilteringVariable;
    this.colorScheme = d3.schemeCategory10;
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

    if (vis.data?.length === 0) {
      vis.renderNoData();
      return;
    }

    vis.data = vis.data.filter((d) => !vis.filterList.includes(d.variable));

    vis.data.sort((b, a) => {
      return vis.asc ? asc(a, b, vis.yAccesor) : desc(a, b, vis.yAccesor);
    });
    vis.data = vis.data.slice(0, vis.nBars);

    vis.populations = store.getState().cantab.populations;
    vis.selectionPopulations = store.getState().cantab.selection_populations;
    vis.loadedDescriptions = store.getState().cantab.descriptions;

    vis.selectedVar = store.getState().evolution.selectedVar;
    vis.selectedPopulation = store.getState().evolution.selectedPopulation;

    vis.descriptions = {};
    store.getState().metadata.attributes.forEach((attr) => {
      if (attr.desc != '') vis.descriptions[attr.name] = attr.desc;
      if (vis.loadedDescriptions[attr.name])
        vis.descriptions[attr.name] = vis.loadedDescriptions[attr.name];
    });

    vis.color = d3.scaleOrdinal().domain(vis.populations).range(vis.colorScheme);

    const allValues = vis.data.map((d) => +d.value);
    const y_max = Math.max(...allValues);

    vis.xScale = d3
      .scaleBand()
      .range([0, vis.width])
      .domain(vis.data.map((d) => vis.xAccesor(d)))
      .padding(0.2);

    vis.xPopulationScale = d3
      .scaleBand()
      .range([0, vis.xScale.bandwidth()])
      .domain(vis.selectionPopulations)
      .padding(0.2);

    vis.yScale = d3.scaleLinear().domain([0, y_max]).range([vis.height, 0]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart
      .selectAll('.bar')
      .data(vis.data)
      .join('rect')
      .attr('class', 'bar')
      .classed(
        'selected',
        (d) => d.variable === vis.selectedVar && d.population === vis.selectedPopulation
      )
      .attr('x', (d) => vis.xScale(vis.xAccesor(d)))
      .attr('y', (d) => vis.yScale(vis.yAccesor(d)))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', (d) => vis.height - vis.yScale(vis.yAccesor(d)))
      .attr('fill', (d) => vis.color(d.population))
      .on('mouseover', function (e, d) {
        vis.tooltip.style('opacity', 1).html(
          `
          Measure: ${d.variable} <br>
          Population: ${d.population} <br>
          ${vis.measure}: ${vis.yAccesor(d).toFixed(3)} <br>
          p-value: ${d.p_value.toFixed(3)} <br> 
          `
        );
      })
      .on('mousemove', function (e, d) {
        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on('mouseout', function () {
        vis.tooltip.style('opacity', 0);
      })
      .on('click', function (e, d) {
        const isSelected = d3.select(this).classed('selected');
        if (isSelected) {
          store.dispatch(setSelectedVar(null));
          store.dispatch(setSelectedPopulation(null));
        } else {
          vis.chart.selectAll('.bar').classed('selected', false);
          store.dispatch(setSelectedVar(d.variable));
          store.dispatch(setSelectedPopulation(d.population));
        }

        d3.select(this).classed('selected', !isSelected);
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
      .call(d3.axisBottom(vis.xScale))
      .selectAll('text')
      .text((d) => {
        return d.split('^')[0];
      })
      .attr('transform', 'translate(0,0)rotate(-15)')
      .style('text-anchor', 'end');

    vis.xAxisG
      .selectAll('.tick')
      .on('click', (e, d) => {
        console.log('adding to filtering variables', d);
        store.dispatch(vis.addFilteringVariable(d));
      })
      .on('mouseover', function (e, d) {
        const tick = d;
        const description = vis.descriptions[tick]
          ? vis.descriptions[tick]
          : 'No description available';
        vis.descTooltip.style('opacity', 1).html(`Description: ${description} `);
      })
      .on('mousemove', function (e, d) {
        moveTooltip(e, vis.descTooltip, vis.chart);
      })
      .on('mouseout', function () {
        vis.descTooltip.style('opacity', 0);
      });

    vis.yAxisG.call(d3.axisLeft(vis.yScale));
  }
}

function asc(a, b, accesor) {
  return accesor(a) - accesor(b);
}

function desc(a, b, accesor) {
  return accesor(b) - accesor(a);
}
