import * as d3 from 'd3';
import store from '@/components/VAPUtils/features/store';
import { SQUARE_LENGTH, EVENTS } from '@/components/VAPUtils/Constants';
import ViewsManager from '../../managers/ViewsManager';
import DataManager from '../../managers/DataManager';
import { addLinks, removeLinks } from '@/components/VAPUtils/features/circular/circularSlice';
import './styles.css';

const manager = ViewsManager.getInstance();
const utils = DataManager.getInstance();

const DECIMALS = 3;
const ROI_SEPARATION = 0.8;
const LOBULE_SEPARATION = 1.3;
const HEMISPHERE_SEPARATION = 2;
const GEOMETRIC_ZOOM_TRANSITION = 750;

export class Circular {
  data;
  constructor(parent) {
    this.parent = parent;
    this.selected_rois = [];
    this.channel = new BroadcastChannel('circular');
    this.channel.onmessage = this.handleChannelMessage.bind(this);
    this.initVis();
  }

  initData(data) {
    let vis = this;
    vis.band = data.band;
    vis.data = data;
  }

  initVis() {
    let vis = this;

    vis.node_to_name = utils.getNodeToName();

    const base_atlas = utils.getBaseAtlas();

    const lobule_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.lobule)));

    vis.lobules = lobule_names;
    /* vis.colors = ["#1f78b4", "#33a02c", "#ff7f00", "#6a3d9a", ]; */
    vis.colors = ['#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf'];

    vis.lobule_colors = {};
    for (var i = 0; i < vis.lobules.length; i++) {
      vis.lobule_colors[vis.lobules[i]] = vis.colors[i];
    }

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg.append('g');

    vis.resize();

    vis.links = vis.chart.append('g').selectAll('.link');
    vis.labels = vis.chart.append('g').selectAll('.label');

    vis.getParentName = function (d) {
      return d.parent.data.name;
    };

    const main_element = d3.select(vis.parent.parentElement);

    vis.tooltip1 = main_element.select('#circular-tooltip-1');

    vis.tooltip2 = main_element.select('#circular-tooltip-2');

    vis.configureZoom();
  }

  configureZoom() {
    let vis = this;
    vis.geometric_zoom = d3
      .zoom()
      .on('zoom', (e) =>
        vis.chart.attr(
          'transform',
          e.transform + ' ' + 'translate(' + vis.middle + ',' + vis.middle + ')'
        )
      );

    vis.svg.call(vis.geometric_zoom);
  }

  manageNode(item, d) {
    let vis = this;
    const is_selected = item.classed('roiSelected');
    const band = store.getState().circular.band;

    // manage links
    if (!is_selected) {
      vis.chart
        .selectAll('.link')
        .filter((link) => {
          return link.nodes.some((node) => node.data.name === d.data.name);
        })
        .classed('linkSelected', true)
        .classed('linkNotSelected', false);
      vis.selected_rois.push({ roi: d.data.name, band: band });
    } else {
      vis.chart
        .selectAll('.link')
        .filter((link) => {
          return link.nodes.some((node) => node.data.name === d.data.name);
        })
        .classed('linkSelected', false);
      vis.selected_rois = vis.selected_rois.filter(
        (i) => !(i.roi == d.data.name && i.band == band)
      );
    }

    // manage node
    // select visually the circle and the label :)
    item.classed('roiSelected', !is_selected);
    vis.chart
      .selectAll('.label')
      .filter((label) => {
        return label.data.name == d.data.name;
      })
      .classed('roiSelected', !is_selected);
  }

  getConnectedRois(roi) {
    let vis = this;
    const connected_rois = [];
    const rois = roi.data.links.map((link) => link.name);

    vis.chart.selectAll('.node').each((i) => {
      if (!vis.lobules.includes(i.data.name)) {
        const links = i.data.links.map((link) => link.name);
        if (rois.includes(i.data.name) || links.includes(roi.data.name)) {
          connected_rois.push(i.data.name);
        }
      }
    });

    return connected_rois;
  }

  manageLink(source, target, is_selected) {
    const link = { x_area: source, y_area: target };
    const symmetricLink = { y_area: source, x_area: target };

    if (!is_selected) {
      manager.removeLink(link);
      manager.removeLink(symmetricLink);
    } else {
      manager.addLink(link);
      manager.addLink(symmetricLink);
    }
  }

  nodeClick(event, roi) {
    let vis = this;

    const item = d3.select(event.target);
    vis.manageNode(item, roi);

    const connected_rois = vis.getConnectedRois(roi);
    const is_selected = item.classed('roiSelected');

    let links = [];
    const origin = roi.data.name;

    const data = { origin: origin, is_selected: is_selected };
    const msg = utils.generateMsg(EVENTS.CLICK_CIRCULAR_NODE, data);
    vis.channel.postMessage(msg);

    connected_rois.forEach((target) => {
      const tmp = { x_node: origin, y_node: target };
      const formatted_link = utils.getLinkData(tmp);
      links.push(formatted_link);
    });

    if (!is_selected) {
      store.dispatch(removeLinks(links));
    } else {
      store.dispatch(addLinks(links));
    }
  }

  showLabelTooltip(item) {
    let vis = this;
    const name = vis.node_to_name[item.data.name];
    vis.tooltip1
      .html(name)
      .style('left', 0 + 'px')
      .style('opacity', 1)
      .style('z-index', 99);
  }

  nodeHovered(item) {
    let vis = this;

    vis.showLabelTooltip(item);
    vis.highlightLinks(item.data.name);
    vis.addTextValue(item);
  }

  addTextValue(item) {
    let vis = this;
    const rois = item.data.links.map((link) => link.name);
    const is_hipo = store.getState().circular.is_hipo;
    const is_hiper = store.getState().circular.is_hiper;

    vis.chart
      .selectAll('.label')
      .filter((label) => {
        return label.data.name == item.data.name;
      })
      .classed('roiHovered', true);

    console.log(item);
    const labels2highlight = [];
    vis.chart.selectAll('.node').each((d) => {
      if (!vis.lobules.includes(d.data.name)) {
        const links = d.data.links.map((link) => link.name);
        if (rois.includes(d.data.name) || links.includes(item.data.name)) {
          const value = rois.includes(d.data.name)
            ? item.data.links.find((link) => link.name == d.data.name).value.toFixed(3)
            : d.data.links.find((link) => link.name == item.data.name).value.toFixed(3);

          labels2highlight.push(d.data.name);

          vis.chart.selectAll('.label').style('opacity', 0);

          vis.chart
            .append('text')
            .classed('valueText', true)
            .text(value)
            .attr(
              'fill',
              value < 0
                ? is_hiper || (!is_hipo && !is_hiper)
                  ? 'red'
                  : 'transparent'
                : is_hipo || (!is_hipo && !is_hiper)
                  ? 'blue'
                  : 'transparent'
            )
            .attr('r', 5)
            .attr('transform', function () {
              return (
                'rotate(' +
                (d.x - 90) +
                ')translate(' +
                (d.y + vis.nodes_radius * 2 + 5) + // this is node size + some padding to generalize
                ',0)' +
                (d.x < 180 ? '' : 'rotate(180)')
              );
            })
            .attr('text-anchor', function () {
              return d.x < 180 ? 'start' : 'end';
            });
        }
      }
    });

    vis.applyClass2Labels(labels2highlight, 'roiHovered', true);
  }

  applyClass2Labels(rois, className, bool) {
    let vis = this;
    vis.chart
      .selectAll('.label')
      .filter((label) => rois.includes(label.data.name))
      .classed(className, bool);
  }

  highlightLinks(name) {
    let vis = this;
    vis.chart
      .selectAll('.link')
      .filter((link) => {
        return link.nodes.some((node) => node.data.name === name);
      })
      .classed('linkHovered', true)
      .classed('linkNotHovered', false)
      .raise();
  }

  nodeHoverOut() {
    let vis = this;
    vis.chart.selectAll('.link').classed('linkHovered', false).classed('linkNotHovered', false);
    vis.chart.selectAll('.valueText').remove();
    vis.chart.selectAll('.label').classed('roiHovered', false);
    vis.tooltip1.style('opacity', 0);
    vis.tooltip2.style('opacity', 0);
    vis.chart.selectAll('.label').style('opacity', 1);
  }

  resize() {
    let vis = this;

    vis.margin = { top: vis.parent.offsetHeight * 0, left: 0 };

    vis.width = SQUARE_LENGTH;
    vis.height = SQUARE_LENGTH;
    vis.matrix_length = Math.min(vis.height, vis.width);
    vis.max_length = Math.max(vis.height, vis.width);

    vis.diameter = vis.matrix_length;
    vis.radius = vis.diameter / 2.8;
    vis.innerRadius = vis.radius;
    vis.middle = vis.diameter / 2;

    vis.cluster = d3
      .cluster()
      .size([360, vis.innerRadius])
      .separation((a, b) => {
        let separation = 0;
        return a.parent.parent === b.parent.parent ? (a.parent === b.parent ? 1 : 1.5) : 3;
      });

    vis.chart.attr('transform', 'translate(' + vis.middle + ',' + vis.middle + ')');
  }

  updateVis() {
    let vis = this;

    vis.cluster = d3
      .cluster()
      .size([360, vis.innerRadius])
      .separation((a, b) => {
        return a.parent.parent === b.parent.parent
          ? a.parent === b.parent
            ? ROI_SEPARATION
            : LOBULE_SEPARATION
          : HEMISPHERE_SEPARATION;
      });

    vis.getParentName = function (d) {
      return d.parent.data.name;
    };

    const curve_value = store.getState().circular.curve_value;

    vis.line = d3
      .lineRadial()
      .curve(d3.curveBundle.beta(curve_value))
      .radius(function (d) {
        return d.y;
      })
      .angle(function (d) {
        return (d.x / 180) * Math.PI;
      });

    if (vis.data.children.length > 0) {
      vis.root = d3.hierarchy(vis.data);
      vis.cluster(vis.root);

      function computeOptimalRadius(totalLeaves) {
        const availableCircumference = 2 * Math.PI * vis.innerRadius;

        const optimalRadius = availableCircumference / (totalLeaves * 2.5);

        return optimalRadius;
      }

      function packageImports(nodes) {
        const map = {},
          links = [];

        // Compute a map from name to node.
        nodes.forEach(function (d) {
          map[d.data.name] = d;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach(function (d) {
          if (d.data.links)
            d.data.links.forEach(function (i) {
              const link = {
                nodes: map[d.data.name].path(map[i.name]),
                value: i.value,
                x_area: d.data.name,
                y_area: i.name
              };
              links.push(link);
            });
        });

        return links;
      }

      vis.nodes_radius = computeOptimalRadius(vis.root.leaves().length);
      vis.packaged_data = packageImports(vis.root.leaves());

      this.renderVis();
    }
  }

  updateLinks() {
    let vis = this;
    const is_hipo = store.getState().circular.is_hipo;
    const is_hiper = store.getState().circular.is_hiper;
    const links = store.getState().circular.links;

    vis.links = vis.chart
      .selectAll('.link')
      .attr('visibility', function (d) {
        if (is_hipo && is_hiper) {
          return 'block';
        } else if (is_hipo) {
          return d.value > 0 ? 'visible' : 'hidden';
        } else if (is_hiper) {
          return d.value < 0 ? 'visible' : 'hidden';
        } else {
          return 'block';
        }
      })
      .attr('stroke', function (d) {
        if (is_hipo && is_hiper) {
          return d.value > 0 ? 'blue' : 'red';
        } else if (is_hipo) {
          return d.value > 0 ? 'blue' : 'transparent';
        } else if (is_hiper) {
          return d.value < 0 ? 'red' : 'transparent';
        } else {
          return 'black';
        }
      });

    vis.links = vis.chart.selectAll('.link').classed('linkSelected', (d) => {
      const bool = links.some(
        (link) =>
          (link.x_node == d.x_area && link.y_node == d.y_area) ||
          (link.x_node == d.y_area && link.y_node == d.x_area)
      );
      return bool;
    });

    vis.chart
      .selectAll('.linkSelected')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .raise();

    function handleMouseOver(d, data) {
      vis.linkHovered(data);
      const msg = utils.generateMsg(EVENTS.HOVER_CIRCULAR_LINK, data);
      vis.channel.postMessage(msg);
    }

    function handleMouseOut(d, i) {
      // Restore opacity for all lines
      vis.linkHoverOut();
      vis.channel.postMessage({ type: EVENTS.HOVER_OUT_CIRCULAR_LINK });
    }
  }

  generateText(data) {
    let vis = this;
    const x_name = vis.node_to_name[data.x_area];
    const y_name = vis.node_to_name[data.y_area];
    const text = `${y_name}   TO   ${x_name}`;

    return text;
  }

  linkHoverOut() {
    let vis = this;
    vis.chart.selectAll('.link').classed('linkHovered', false).classed('linkNotHovered', false);

    vis.tooltip1.style('opacity', 0);
    vis.tooltip2.style('opacity', 0);
  }

  linkHovered(data) {
    let vis = this;
    const sel = vis.chart
      .selectAll('.linkSelected')
      .filter((d) => d.x_area == data.x_area && d.y_area == data.y_area);

    const item = sel.node();
    const datum = sel.datum();

    d3.select(item).classed('linkHovered', true).classed('linkNotHovered', false).raise();

    const text = vis.generateText(datum);

    vis.tooltip1
      .html(text)
      .style('left', 0 + 'px')
      .style('opacity', 1)
      .style('z-index', 99);

    const value = datum.value;
    vis.tooltip2
      .html(
        "VALUE: <span style='color:" +
          (value >= 0 ? 'red' : 'blue') +
          ";'>" +
          value.toFixed(DECIMALS) +
          '</span>'
      )
      .style('right', 0 + 'px')
      .style('opacity', 1);
  }

  updateLinkOpacity() {
    let vis = this;
    const link_opacity = store.getState().circular.link_opacity;
    vis.chart.selectAll('.link').attr('opacity', link_opacity);
  }

  renderVis() {
    let vis = this;
    const link_opacity = store.getState().circular.link_opacity;
    const band = store.getState().circular.band;

    vis.links = vis.chart
      .selectAll('.link')
      .data(vis.packaged_data)
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => vis.line(d.nodes))
      .attr('opacity', link_opacity)
      .attr('fill', 'none')
      .on('click', handleMouseLinkClick)
      .transition()
      .duration(1250);

    vis.updateLinks();

    vis.labels = vis.chart
      .selectAll('.label')
      .data(vis.root.leaves())
      .join('text')
      .attr('class', 'label')
      .classed('roiSelected', (d) =>
        vis.selected_rois.some((item) => item.roi == d.data.name && item.band == band)
      )
      .transition()
      .duration(1250)
      .attr('dy', '0.31em')
      .style('font-size', `12px`)
      .style(
        'font-family',
        "font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'"
      )
      .attr('transform', function (d) {
        return (
          'rotate(' +
          (d.x - 90) +
          ')translate(' +
          (d.y + vis.nodes_radius * 2 + 5) + // this is node size + some padding to generalize
          ',0)' +
          (d.x < 180 ? '' : 'rotate(180)')
        );
      })
      .attr('text-anchor', function (d) {
        return d.x < 180 ? 'start' : 'end';
      })
      .text(function (d) {
        return d.data.name;
      });

    vis.chart
      .selectAll('.label')
      .on('mouseover', handleMouseLabelHover)
      .on('mouseout', handleMouseLabelHoverOut);

    function handleMouseLabelHover(e, d) {
      vis.showLabelTooltip(d);
    }

    function handleMouseLabelHoverOut(e, d) {
      vis.tooltip1.style('opacity', 0);
    }

    vis.nodes = vis.chart
      .selectAll('.node')
      .data(vis.root.leaves())
      .join('circle')
      .attr('class', 'node')
      .classed('roiSelected', (d) =>
        vis.selected_rois.some((item) => item.roi == d.data.name && item.band == band)
      )
      .transition()
      .duration(1250)
      .attr('transform', function (d) {
        return 'rotate(' + (d.x - 90) + ')translate(' + (d.y + vis.nodes_radius / 2 + 5) + ',0)';
      })
      .attr('r', function (d, i) {
        return vis.nodes_radius;
      })
      /* .attr("stroke", "black") */
      .attr('fill', (d) => {
        return vis.lobule_colors[vis.getParentName(d)];
      })
      .style('opacity', 1);

    vis.chart
      .selectAll('.node')
      .on('mouseover', handleMouseNodeHover)
      .on('mouseout', handleMouseNodeOut)
      .on('click', handleMouseNodeClick);

    function handleMouseNodeClick(event, d) {
      vis.nodeClick(event, d);
    }

    function handleMouseNodeHover(event, d) {
      const hovered_node = d.data.name;
      const msg = utils.generateMsg(EVENTS.HOVER_CIRCULAR_NODE, hovered_node);
      vis.channel.postMessage(msg);
      vis.nodeHovered(d);
    }

    function handleMouseNodeOut(d, i) {
      vis.channel.postMessage({ type: EVENTS.HOVER_OUT_CIRCULAR_NODE });
      vis.nodeHoverOut();
    }

    function handleMouseLinkClick(d, elm) {
      const is_selected = d3.select(d.target).classed('linkSelected');
      const link = utils.getLinkData({
        x_node: elm.x_area,
        y_node: elm.y_area
      });

      if (is_selected) {
        store.dispatch(removeLinks([link]));
      } else {
        store.dispatch(addLinks([link]));
      }
    }
  }

  resetGeometricZoom() {
    let vis = this;
    vis.svg
      .transition()
      .duration(GEOMETRIC_ZOOM_TRANSITION)
      .call(vis.geometric_zoom.transform, d3.zoomIdentity);
  }

  selectNode(origin, is_selected) {
    let vis = this;
    vis.chart
      .selectAll('.node')
      .filter((node) => {
        return node.data.name == origin;
      })
      .classed('roiSelected', is_selected);
    vis.chart
      .selectAll('.label')
      .filter((label) => {
        return label.data.name == origin;
      })
      .classed('roiSelected', is_selected);
  }

  // ############################## COORDINATION ##############################

  handleChannelMessage(e) {
    const message = e.data;
    switch (message.type) {
      case EVENTS.CLICK_CIRCULAR_NODE:
        const origin = message.data.origin;
        const is_selected = message.data.is_selected;
        this.selectNode(origin, is_selected);
        break;

      case EVENTS.HOVER_CIRCULAR_NODE:
        const node_name = message.data;
        const item = this.chart
          .selectAll('.node')
          .filter((node) => {
            return node.data.name == node_name;
          })
          .datum();
        this.nodeHovered(item);
        break;

      case EVENTS.HOVER_OUT_CIRCULAR_NODE:
        this.nodeHoverOut();
        break;

      case EVENTS.HOVER_CIRCULAR_LINK:
        const data = message.data;
        this.linkHovered(data);
        break;

      case EVENTS.HOVER_OUT_CIRCULAR_LINK:
        this.linkHoverOut();
        break;

      case EVENTS.RESET_CIRCULAR_NODE_SELECTION:
        this.selected_nodes = { x_nodes: [], y_nodes: [] };
        this.drawSelectedNodes();
        break;

      case EVENTS.RESET_CIRCULAR_GEOMETRIC_ZOOM:
        this.resetGeometricZoom();
        break;
    }
  }
}
