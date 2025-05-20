import { addLinks, removeLinks } from '@/components/VAPUtils/features/matrix/matrixSlice';
import { SQUARE_LENGTH, EVENTS } from '../../../VAPUtils/Constants';
import store from '@/components/VAPUtils/features/store';
import DataManager from '../../managers/DataManager';
import * as d3 from 'd3';
import './styles.css';

const NON_DIVERGENT_RANGE = [0, 1];
const DIVERGENT_RANGE = [-5, 0, 5];
const MATRIX_TOOLTIP_DECIMALS = 3;
const GEOMETRIC_ZOOM_TRANSITION = 750;
const CELLS_TRANSITION = 750;
const AXIS_TRANSITION = 750;
const HIGHLIGHT_LINE_COLOR = '#50c878';

const utils = DataManager.getInstance();

export class Matrix {
  data;
  parent;
  selected_nodes = { x_nodes: [], y_nodes: [] };
  config;
  selecting = false;

  constructor(parent) {
    this.parent = parent;
    this.config = store.getState().matrix.config;
    this.is_brush_moving = false;
    this.brushed_nodes = { x_nodes: [], y_nodes: [] };
    this.zoom_list = [];
    this.reset = true;

    this.lowDivergentColor = '#FF0000'; //'#FF3D3D'
    this.middleColor = '#fee08b';
    this.highDivergentColor = '#0000FF'; // '#3D6BFF'

    this.channel = new BroadcastChannel('matrix');
    this.channel.onmessage = this.handleChannelMessage.bind(this);
    this.initVis();
  }

  // ############################## INIT, UPDATE, RENDER ##############################

  initVis() {
    let vis = this;

    vis.margin = { top: 60, left: 60 }; // a little margin so labels can fit on the container

    vis.svg = d3.select(vis.parent);
    vis.chart = vis.svg
      .append('g')
      .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

    const main_element = d3.select(vis.parent.parentElement);

    vis.tooltip = main_element.select('#matrix-tooltip').attr('class', 'tooltip');

    vis.original_scale = d3.scaleBand();

    vis.x_scale = d3.scaleBand();
    vis.x_axis = d3.axisTop(vis.x_scale).tickSize(0).tickSizeOuter(0);
    vis.x_axis_g = vis.chart.append('g').attr('class', 'x-axis');

    vis.y_scale = d3.scaleBand();
    vis.y_axis = d3.axisLeft(vis.y_scale).tickSize(0).tickSizeOuter(0);
    vis.y_axis_g = vis.chart.append('g').attr('class', 'y-axis');

    vis.color_scale = d3.scaleLinear();

    //vis.configureZoom();
    vis.setNodeColors();
    vis.setSize();
  }

  handleContextMenu(event) {
    let vis = this;
    event.preventDefault();
    event.stopPropagation();
    if (event.button === 2) {
      const mouseStart = d3.pointer(event, this);
      const initialTransform = d3.zoomTransform(this);
      vis.svg.on('mousemove.pan', (event) => {
        const mouseCurrent = d3.pointer(event, this);
        const dx = mouseCurrent[0] - mouseStart[0];
        const dy = mouseCurrent[1] - mouseStart[1];
        const scale = initialTransform.k;
        const tx = initialTransform.x + dx / scale;
        const ty = initialTransform.y + dy / scale;
        const newTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        this.svg.call(vis.geometric_zoom.transform, newTransform);
      });
      vis.svg.on('mouseup.pan', () => vis.svg.on('mousemove.pan', null).on('mouseup.pan', null));
    }
  }

  configureZoom() {
    let vis = this;
    vis.geometric_zoom = d3.zoom().on('zoom', (e) => {
      vis.chart.attr(
        'transform',
        e.transform + ' ' + 'translate(' + vis.margin.left + ',' + vis.margin.top + ')'
      );
    });

    vis.svg
      .call(vis.geometric_zoom)
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchmove.zoom', null)
      .on('touchend.zoom', null);

    /* vis.svg.on('contextmenu', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.button === 2) {
        // Solo actúa si es el botón derecho del ratón
        var mouseStart = d3.pointer(event, this);
        var initialTransform = d3.zoomTransform(this);
        var previousTransform = initialTransform;

        vis.svg.on('mousemove.pan', function (event) {
          var mouseCurrent = d3.pointer(event, this);
          var dx = mouseCurrent[0] - mouseStart[0];
          var dy = mouseCurrent[1] - mouseStart[1];

          var scale = initialTransform.k;
          var tx = initialTransform.x + dx;
          var ty = initialTransform.y + dy;

          var newTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);
          vis.svg.call(vis.geometric_zoom.transform, newTransform);
          previousTransform = newTransform;
        });

        vis.svg.on('mouseup.pan', function () {
          vis.svg.on('mousemove.pan', null).on('mouseup.pan', null);
        });
      }
    }); */
  }

  updateVis() {
    let vis = this;
    vis.filterLinks();
    vis.generateAxisScales();
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // check if we need to divide the matrix
    const divided = store.getState().matrix.divided;
    if (divided) vis.divideMatrix();

    vis.chart
      .selectAll('.matrix_cell')
      .data(vis.links)
      .join('rect')
      .attr('class', 'matrix_cell')
      .transition()
      .duration(CELLS_TRANSITION)
      .attr('x', function (d) {
        return vis.x_scale(d.x_node);
      })
      .attr('y', function (d) {
        return vis.y_scale(d.y_node);
      })
      .attr('width', vis.x_scale.bandwidth())
      .attr('height', vis.y_scale.bandwidth())
      .attr('z-index', 1)
      .style('fill', function (d) {
        return vis.color_scale(d.value);
      })
      .style('opacity', 1);

    vis.updateAxes();
    vis.configInteraction();
    vis.drawSelectedNodes();
    vis.drawSelectedLinks();

    vis.overlay.on('mousedown', vis.handleOverlayMouseDown.bind(vis)).on('mouseleave', (e) => {
      vis.hoverOut();
      vis.channel.postMessage({ type: EVENTS.HOVER_OUT_MATRIX_LINK });
    });
  }

  updateAxes() {
    let vis = this;
    const numTicks = vis.x_nodes.length;
    const fontSize = Math.min(Math.max(5, 180 / numTicks), 14);

    vis.x_axis_g.transition().duration(AXIS_TRANSITION).call(vis.x_axis).select('.domain').remove();

    vis.y_axis_g.transition().duration(AXIS_TRANSITION).call(vis.y_axis).select('.domain').remove();

    vis.x_axis_g
      .selectAll('text')
      .attr('text-anchor', 'start')
      .attr('z-index', 1)
      .attr('transform', `translate(${5}, ${-4})rotate(-90)`)
      .style('font-size', `${fontSize}px`)
      .append('title');

    vis.x_axis_g.selectAll('rect').remove();
    vis.x_axis_g
      .selectAll('.tick')
      .append('rect')
      .attr('x', -vis.x_scale.bandwidth() / 2)
      .attr('y', -Math.min(fontSize * 5, vis.margin.top))
      .attr('width', vis.x_scale.bandwidth())
      .attr('height', Math.min(fontSize * 5, vis.margin.top) - 2)
      .attr('fill', function (d) {
        const roi = vis.data.nodes.find((roi) => roi.acronim === d);
        if (roi) {
          const color = vis.lobule_colors[roi.lobule];
          return color;
        } else return 'transparent';
      });

    vis.x_axis_g
      .selectAll('.tick')
      .append('title')
      .text((d) => {
        const roi = vis.data.nodes.find((roi) => roi.acronim === d);
        return roi?.title;
      });

    vis.x_axis_g.selectAll('text').raise();

    vis.y_axis_g
      .selectAll('text')
      .style('font-size', `${fontSize}px`)
      .attr('transform', `translate(${-2}, ${0})`);
    vis.y_axis_g.selectAll('rect').remove();
    vis.y_axis_g
      .selectAll('.tick')
      .append('rect')
      .attr('x', -Math.min(fontSize * 5, vis.margin.left))
      .attr('y', -vis.y_scale.bandwidth() / 2)
      .attr('width', Math.min(fontSize * 5, vis.margin.left) - 2) // Adjust based on text length
      .attr('height', vis.y_scale.bandwidth())
      .attr('fill', function (d) {
        const roi = vis.data.nodes.find((roi) => roi.acronim === d);
        if (roi) {
          const color = vis.lobule_colors[roi.lobule];
          return color;
        } else return 'transparent';
      });

    vis.y_axis_g.selectAll('text').raise();

    vis.y_axis_g
      .selectAll('.tick')
      .append('title')
      .text((d) => {
        const roi = vis.data.nodes.find((roi) => roi.acronim === d);
        return roi?.title;
      });
  }

  handleOverlayMouseDown(e) {
    let vis = this;
    if (e.button === 0 && e.ctrlKey) {
      vis.resetZoom();
      vis.channel.postMessage({ type: EVENTS.RESET_ZOOM_MATRIX });
    }
    if (e.button === 0 && e.altKey) {
      vis.zoomSelectedLinks();
      vis.channel.postMessage({ type: EVENTS.ZOOM_MATRIX_SELECTED_LINKS });
    }
  }

  getTickColor(d) {
    const roi = this.data.nodes.find((roi) => roi.acronim === d);
    return roi ? this.lobule_colors[roi.lobule] : 'transparent';
  }

  resetGeometricZoom() {
    let vis = this;
    vis.svg
      .transition()
      .duration(GEOMETRIC_ZOOM_TRANSITION)
      .call(vis.geometric_zoom.transform, d3.zoomIdentity);
  }

  resetZoom() {
    let vis = this;
    const nodes = vis.zoom_list.pop();
    if (nodes) vis.zoomNodes(nodes);
    else if (!vis.reset) {
      vis.reset = true;
      vis.resetMatrix();
    }
  }

  // ############################## COORDINATION ##############################

  handleChannelMessage(e) {
    const message = e.data;
    switch (message.type) {
      case EVENTS.HOVER_MATRIX_LINK:
        const nodes = message.data.nodes;
        this.checkLink(nodes);
        break;

      case EVENTS.HOVER_OUT_MATRIX_LINK:
        this.hoverOut();
        break;

      case EVENTS.ZOOM_MATRIX_BRUSH:
        this.zoom_list.push(utils.getCopy({ x_nodes: this.x_nodes, y_nodes: this.y_nodes }));
        const area = message.data;
        this.zoomNodes(area);
        break;

      case EVENTS.SELECT_MATRIX_BRUSH:
        const selected_nodes = message.data;
        //this.addOrRemoveLinks(selected_nodes, true);
        break;

      case EVENTS.UNSELECT_MATRIX_BRUSH:
        const unselected_nodes = message.data;
        //this.addOrRemoveLinks(unselected_nodes, false);
        break;

      case EVENTS.ZOOM_MATRIX_SELECTED_NODES:
        this.zoomSelectedNodes();
        break;
      case EVENTS.ZOOM_MATRIX_SELECTED_LINKS:
        /*         this.zoom_list.push(
          utils.getCopy({ x_nodes: this.x_nodes, y_nodes: this.y_nodes })
        ); */
        this.zoomSelectedLinks();
        break;

      case EVENTS.RESET_ZOOM_MATRIX:
        this.resetZoom();
        break;

      case EVENTS.CLICK_MATRIX_NODE:
        this.clickNode(message.data);
        break;

      case EVENTS.RESET_MATRIX_NODE_SELECTION:
        this.selected_nodes = { x_nodes: [], y_nodes: [] };
        this.drawSelectedNodes();
        break;

      case EVENTS.CLICK_MATRIX_LINK:
        this.clickLink(message.data);
        break;

      case EVENTS.RESET_MATRIX_GEOMETRIC_ZOOM:
        this.resetGeometricZoom();
        break;
    }
  }

  // ############################## INTERACTION ##############################

  configInteraction() {
    let vis = this;

    vis.overlay = vis.chart.selectAll('.overlay');

    vis.configSelectNodes();
    vis.configBrush();
    vis.configSelectLinks();
    vis.configTooltip();
  }

  getNodes(pos) {
    let vis = this;
    const y = vis.getIndex(pos[1], 'x', false);
    const x = vis.getIndex(pos[0], 'y', false);
    const x_node = vis.x_scale.domain()[x];
    const y_node = vis.y_scale.domain()[y];
    return { x_node, y_node };
  }

  renderHighlightLines(data) {
    let vis = this;

    vis.chart.selectAll('.highlightLine').remove();

    const x_pos = vis.x_scale(data.x_node);
    const y_pos = vis.y_scale(data.y_node);

    vis.chart
      .append('line')
      .attr('class', 'highlightLine')
      .attr('x1', x_pos)
      .attr('y1', 0)
      .attr('x2', x_pos)
      .attr('y2', vis.graph_length)
      .attr('stroke', HIGHLIGHT_LINE_COLOR)
      .attr('stroke-width', 0.5);

    vis.chart
      .append('line')
      .attr('class', 'highlightLine')
      .attr('x1', x_pos + vis.x_scale.bandwidth())
      .attr('y1', 0)
      .attr('x2', x_pos + vis.x_scale.bandwidth())
      .attr('y2', vis.graph_length)
      .attr('stroke', HIGHLIGHT_LINE_COLOR)
      .attr('stroke-width', 0.5);

    vis.chart
      .append('line')
      .attr('class', 'highlightLine')
      .attr('x1', 0)
      .attr('y1', y_pos)
      .attr('x2', vis.graph_length)
      .attr('y2', y_pos)
      .attr('stroke', HIGHLIGHT_LINE_COLOR)
      .attr('stroke-width', 0.5);

    vis.chart
      .append('line')
      .attr('class', 'highlightLine')
      .attr('x1', 0)
      .attr('y1', y_pos + vis.y_scale.bandwidth())
      .attr('x2', vis.graph_length)
      .attr('y2', y_pos + vis.y_scale.bandwidth())
      .attr('stroke', HIGHLIGHT_LINE_COLOR)
      .attr('stroke-width', 0.5);
  }

  computePosition(orientation, rect, x, y) {
    let c_x, c_y;

    if (orientation === 'NO') {
      c_x = x - rect.width - 10;
      c_y = y - rect.height - 10;
    } else if (orientation === 'NE') {
      c_x = x + 10;
      c_y = y - rect.height - 10;
    } else if (orientation === 'SO') {
      c_x = x - rect.width - 10;
      c_y = y  + 10;
    } else {
      c_x = x + 10;
      c_y = y + 10;
    }

    return [c_x, c_y];
  }

  getQuadrant(cell) {
    let vis = this;
    const pos = cell.node().getBoundingClientRect();
    const boundingRect = vis.svg.node().getBoundingClientRect();

    const centerX = pos.x + pos.width / 2;
    const centerY = pos.y + pos.height / 2;

    const spaceLeft = centerX - boundingRect.x;
    const spaceRight = boundingRect.x + boundingRect.width - centerX;
    const spaceTop = centerY - boundingRect.y;
    const spaceBottom = boundingRect.y + boundingRect.height - centerY;

    if (spaceRight >= spaceLeft && spaceBottom >= spaceTop) return 'SE';
    if (spaceRight >= spaceLeft && spaceTop > spaceBottom) return 'NE';
    if (spaceLeft > spaceRight && spaceBottom >= spaceTop) return 'SO';
    return 'NO';
  }

  showTooltip(cell) {
    let vis = this;

    const data = cell.datum();
    const pos = cell.node().getBoundingClientRect();
    const text = vis.generateText(data);
    const rect = vis.tooltip.node().getBoundingClientRect();
    vis.renderHighlightLines(data);
    const x = pos.x;
    const y = pos.y;

    const orientation = vis.getQuadrant(cell);
    let [c_x, c_y] = vis.computePosition(orientation, rect, x, y);

    vis.tooltip
      .html(text)
      .style('left', c_x + 'px')
      .style('top', c_y + 'px')
      .style('opacity', 1);
  }

  checkLink(nodes) {
    let vis = this;
    if (!vis.newNodes(nodes)) return true;

    let cell = vis.chart
      .selectAll('.matrix_cell')
      .filter((d) => d.y_node === nodes.y_node && d.x_node === nodes.x_node);

    const hovered_cell = vis.hovered_cell?.data()[0];

    if (cell.empty()) {
      vis.hovered_cell = undefined;
      vis.hoverOut();
      return false;
    } else if (hovered_cell?.y_node !== nodes.y_node || hovered_cell?.x_node !== nodes.x_node) {
      vis.hovered_cell = cell;
    }
    vis.x_node_hovered = nodes.x_node;
    vis.y_node_hovered = nodes.y_node;
    vis.showTooltip(vis.hovered_cell);
    return true;
  }

  hoverOut() {
    let vis = this;
    vis.tooltip.style('opacity', 0);
    vis.chart.selectAll('.highlightLine').remove();
    vis.hovered_cell?.classed('hovered', false);
    vis.hovered_cell = undefined;
    vis.x_node_hovered = null;
    vis.y_node_hovered = null;
  }

  configTooltip() {
    let vis = this;

    if (vis.config.tooltip) {
      vis.overlay.on('mousemove', hoverAndSendMsg.bind(this));
    } else {
      vis.overlay.on('mouseover', null).on('mousemove', null).on('mouseleave', null);
    }

    function hoverAndSendMsg(e) {
      let pos = d3.pointer(e);
      const nodes = vis.getNodes(pos);
      console.log(e.movementX, e.movementY);

      if (vis.checkLink(nodes)) {
        const data = { nodes };
        const msg = utils.generateMsg(EVENTS.HOVER_MATRIX_LINK, data);
        vis.channel.postMessage(msg);
      } else {
        vis.channel.postMessage({ type: EVENTS.HOVER_OUT_MATRIX_LINK });
      }
    }
  }

  newNodes(nodes) {
    let vis = this;
    return nodes.x_node !== vis.x_node_hovered || nodes.y_node !== vis.y_node_hovered;
  }

  configSelectLinks() {
    let vis = this;

    if (vis.config.select_links) {
      vis.overlay.on('click', (e) => {
        clickOverlay(e);
      });
    } else {
      vis.overlay.on('click', () => {});
    }

    function clickOverlay(e) {
      const pos = d3.pointer(e);
      const { x_node, y_node } = vis.getNodes(pos);

      const item = vis.chart
        .selectAll('.matrix_cell')
        .filter((data) => data.y_node == y_node && data.x_node == x_node);

      if (!item.empty()) {
        const is_selected = item.classed('selected');

        const selection = vis.chart
          .selectAll('.matrix_cell')
          .filter(
            (data) =>
              (data.y_node == y_node && data.x_node == x_node) ||
              (data.y_node == x_node && data.x_node == y_node && vis.config.sync_select_links)
          );
        selection.classed('selected', !is_selected);
        selection.data().forEach((link) => {
          const formatted_link = utils.getLinkData(link);
          if (!is_selected) {
            store.dispatch(addLinks([formatted_link]));
          } else {
            store.dispatch(removeLinks([formatted_link]));
          }
        });
      }
    }
  }

  updateIndex(index, attrs) {
    const attr = attrs[index];
    const type = attr.type.name;
    const measure = attr.measure.name;
    const band = attr.band.name;

    this.chart.selectAll('.matrixIndex').remove();

    const textElement = this.chart
      .append('text')
      .attr('class', 'matrixIndex')
      .attr('y', -35)
      .style('font-size', '10px')
      .style('fill', 'black')
      .style('text-anchor', 'start');

    const tmp1 = textElement.append('tspan').text(type).attr('dy', '1em');
    const tmp2 = textElement.append('tspan').text(measure).attr('dy', '1em');
    const tmp3 = textElement.append('tspan').text(band).attr('dy', '1em');

    // Medir el tamaño de cada tspan por separado
    const bbox1 = tmp1.node().getBBox().width;
    const bbox2 = tmp2.node().getBBox().width;
    const bbox3 = tmp3.node().getBBox().width;

    const width = Math.max(bbox1, bbox2, bbox3);

    // Aplicar los valores de 'x' individualmente
    tmp1.attr('x', -width - 5);
    tmp2.attr('x', -width - 5);
    tmp3.attr('x', -width - 5);
  }

  drawSelectedNodes() {
    let vis = this;

    vis.x_axis_g.selectAll('.tick').each(function (d) {
      const element = d3.select(this);
      const isSelected = vis.selected_nodes.x_nodes.includes(d);
      element.classed('selectedNode', isSelected);
    });

    vis.y_axis_g.selectAll('.tick').each(function (d) {
      const element = d3.select(this);
      const isSelected = vis.selected_nodes.y_nodes.includes(d);

      element.classed('selectedNode', isSelected);
    });
  }

  clickLobule(roi, is_selected, axis) {
    let vis = this;
    const lobule_rois = vis.data.nodes
      .filter((r) => r.hemisphere == roi.hemisphere && r.lobule == roi.lobule)
      .map((roi) => roi.acronim);
    is_selected
      ? (vis.selected_nodes[axis] = vis.selected_nodes[axis].filter((item) => {
          return !lobule_rois.includes(item);
        }))
      : vis.selected_nodes[axis].push(...lobule_rois);
  }

  clickText(roi_acronim, is_selected, axis) {
    let vis = this;
    is_selected
      ? (vis.selected_nodes[axis] = vis.selected_nodes[axis].filter((item) => item !== roi_acronim))
      : vis.selected_nodes[axis].push(roi_acronim);
  }

  clickNode(target) {
    let vis = this;
    const axis = target.axis;
    const is_selected = target.is_selected;
    const roi_acronim = target.roi_acronim;
    const tag_name = target.tag_name;

    if (tag_name == 'rect') {
      const roi = vis.data.nodes.find((roi) => roi.acronim == roi_acronim);
      if (vis.config.sync_select_nodes) {
        vis.clickLobule(roi, is_selected, 'x_nodes');
        vis.clickLobule(roi, is_selected, 'y_nodes');
      } else {
        vis.clickLobule(roi, is_selected, axis);
      }
    } else {
      if (vis.config.sync_select_nodes) {
        vis.clickText(roi_acronim, is_selected, 'x_nodes');
        vis.clickText(roi_acronim, is_selected, 'y_nodes');
      } else {
        vis.clickText(roi_acronim, is_selected, axis);
      }
    }

    vis.drawSelectedNodes();
  }

  configSelectNodes() {
    let vis = this;

    if (vis.config.select_areas) {
      vis.chart.selectAll('.tick').on('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.button == 0) {
          const target = utils.generateTickTarget(e);
          vis.clickNode(target);
          const msg = utils.generateMsg(EVENTS.CLICK_MATRIX_NODE, target);
          vis.channel.postMessage(msg);
        }
        if (e.button == 0 && e.altKey) {
          if (vis.selected_nodes.x_nodes.length > 0 && vis.selected_nodes.y_nodes.length > 0) {
            vis.zoomSelectedNodes();
            const msg = utils.generateMsg(EVENTS.ZOOM_MATRIX_SELECTED_NODES);
            vis.channel.postMessage(msg);
          }
        }
      });
    } else {
      vis.chart.selectAll('.tick').on('hover', (e) => {
        e.stopPropagation();
      });
    }
  }

  configBrush() {
    let vis = this;
    if (vis.config.brush) {
      vis.configureBrush();
      vis.overlay = vis.generateBrush();
    } else {
      vis.chart.call(vis.brush.move, null);

      vis.chart.selectAll('.brush').remove(); // Elimina la capa visual del brush
      vis.chart.on('.brush', null); // Quita cualquier evento vinculado

      if (vis.brush) {
        vis.brush.on('brush', null).on('end', null).on('start', null); // Elimina los eventos
      }

      /*  vis.overlay.remove();

      vis.overlay = vis.chart
        .append('rect')
        .attr('width', vis.graph_length)
        .attr('height', vis.graph_length)
        .attr('fill', 'transparent')
        .attr('position', 'relative')
        .attr('class', 'overlay')
        .attr('pointer-events', 'all')
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')'); */
      /* vis.overlay.on('contextmenu', null); */
    }
  }

  handleBrushKeydown(e) {
    let vis = this;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === ' ' && vis.config.select_links) {
      //vis.addOrRemoveLinks(vis.brushed_nodes, true);
      vis.addBrushedLinks();
      /* const msg = utils.generateMsg(
        EVENTS.SELECT_MATRIX_BRUSH,
        vis.brushed_nodes
      );
      vis.channel.postMessage(msg); */
    }

    if (e.key === 'Backspace') {
      //vis.addOrRemoveLinks(vis.brushed_nodes, false);
      vis.removeBrushedLinks();
      /* const msg = utils.generateMsg(
        EVENTS.UNSELECT_MATRIX_BRUSH,
        vis.brushed_nodes
      );
      vis.channel.postMessage(msg); */
    }
  }

  configBrushListeners() {
    let vis = this;

    vis.chart
      .selectAll('.selection')
      .on('mousedown', (e) => {
        if (e.button === 0 && e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          vis.zoom_list.push(utils.getCopy({ x_nodes: vis.x_nodes, y_nodes: vis.y_nodes }));
          vis.zoomNodes(vis.brushed_nodes);

          const msg = utils.generateMsg(EVENTS.ZOOM_MATRIX_BRUSH, vis.brushed_nodes);
          vis.channel.postMessage(msg);
        }
      })
      .on('mouseover', (e) => {
        d3.select(window).on('keydown', vis.handleBrushKeydown.bind(vis));
      })
      .on('mouseout', (e) => {
        d3.select(window).on('keydown', null);
      });

    vis.chart.selectAll('.brush-nice').on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      vis.chart.call(vis.brush.move, null);
    });
  }

  addOrRemoveLinks(nodes, add_links) {
    let vis = this;
    const { x_nodes, y_nodes } = nodes;
    const existingLinks = store.getState().matrix.links;
    const links = vis.links.filter(
      (link) => x_nodes.includes(link.x_node) && y_nodes.includes(link.y_node)
    );

    const newLinks = vis.addItems2List(links, existingLinks, add_links);

    if (add_links) {
      store.dispatch(addLinks(newLinks));
    } else {
      store.dispatch(removeLinks(newLinks));
    }
  }

  addBrushedLinks() {
    let vis = this;
    const { x_nodes, y_nodes } = vis.brushed_nodes;
    const links = vis.links.filter(
      (link) =>
        (x_nodes.includes(link.x_node) && y_nodes.includes(link.y_node)) ||
        (vis.config.sync_select_links &&
          x_nodes.includes(link.y_node) &&
          y_nodes.includes(link.x_node))
    );
    store.dispatch(addLinks(links));
  }

  removeBrushedLinks() {
    let vis = this;
    const { x_nodes, y_nodes } = vis.brushed_nodes;
    const links = vis.links.filter(
      (link) => x_nodes.includes(link.x_node) && y_nodes.includes(link.y_node)
    );
    store.dispatch(removeLinks(links));
  }

  resetMatrix() {
    let vis = this;
    vis.hoverOut();
    vis.x_nodes = vis.data.nodes.map((roi) => roi.acronim);
    vis.y_nodes = vis.x_nodes;
    vis.updateVis();
  }

  // ############################## GENERATE BRUSH ##############################

  configureBrush() {
    let vis = this;
    vis.brush = d3.brush().extent([
      [0, 0],
      [vis.graph_length, vis.graph_length]
    ]);

    vis.brush // Set the extent of the brush
      .on('brush', vis.brushmove.bind(vis))
      .on('end', vis.brushend.bind(vis))
      .on('start', vis.brushstart.bind(vis));
  }

  brushstart(e) {
    let vis = this;
    vis.chart.selectAll('.brush-nice').remove();
    vis.hoverOut();
  }

  brushmove(e) {
    let vis = this;
    vis.chart.selectAll('.brush-nice').remove();
    if (vis.is_brush_moving) return;

    const selection = e.selection;
    if (!selection) return;

    vis.is_brush_moving = true;

    const x0 = selection[0][0];
    const y0 = selection[0][1];
    const x1 = selection[1][0];
    const y1 = selection[1][1];

    vis.chart
      .append('rect')
      .attr('class', 'brush-nice')
      .attr('x', 0)
      .attr('y', y0)
      .attr('width', vis.graph_length)
      .attr('height', y1 - y0);

    vis.chart
      .append('rect')
      .attr('class', 'brush-nice')
      .attr('x', x0)
      .attr('y', 0)
      .attr('width', x1 - x0)
      .attr('height', vis.graph_length);

    vis.chart.selectAll('.brush-nice').style('fill', 'grey').style('opacity', 0.2);

    vis.is_brush_moving = false;
    vis.chart.selectAll('.handle').raise();
    vis.chart.selectAll('.selection').raise();
  }

  brushend(e) {
    let vis = this;
    const selection = e.selection;

    if (!selection) {
      return;
    } else {
      const x = selection[0];
      const y = selection[1];

      const x_indices = [vis.getIndex(x[0], 'y', true), vis.getIndex(y[0], 'y', true)];
      const y_indices = [vis.getIndex(x[1], 'x', true), vis.getIndex(y[1], 'x', true)];

      const x_nodes = vis.x_scale.domain().slice(x_indices[0], x_indices[1]);
      const y_nodes = vis.y_scale.domain().slice(y_indices[0], y_indices[1]);

      vis.brushed_nodes = { x_nodes, y_nodes };
      vis.configBrushListeners();
    }
  }

  generateBrush() {
    let vis = this;
    vis.chart.selectAll('.brush').remove();
    vis.chart.call(vis.brush);
    vis.overlay.raise();
    return vis.chart.selectAll('.overlay');
  }

  // ############################## COLOR AND SCALES ##############################

  generateColorScale() {
    let vis = this;
    const divergent = vis.matrix_max_value > 1;
    const domain = divergent ? DIVERGENT_RANGE : NON_DIVERGENT_RANGE;
    const range = divergent
      ? [vis.lowDivergentColor, vis.middleColor, vis.highDivergentColor]
      : [vis.middleColor, vis.highDivergentColor];

    vis.color_scale.domain(domain).range(range);

    vis.generateScale(domain);
  }

  generateAxisScales() {
    let vis = this;
    if (vis.zoom_list.length > 0 && vis.config.filter_zoom) vis.filterZoomNodes();
    vis.x_scale.range([0, vis.graph_length]).domain(vis.x_nodes);
    vis.y_scale.range([0, vis.graph_length]).domain(vis.y_nodes);
  }

  generateScale(domain) {
    const { svg, color_scale: colorScale, attr, margin, graph_length } = this;
    let start, midPoint, end;
    if (domain.length > 2) {
      [start, midPoint, end] = domain;
    } else {
      [start, end] = domain;
      midPoint = (start + end) / 2;
    }

    // Remove any existing gradient definitions
    svg.selectAll('defs').remove();

    // Define the gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', `colorGradient${attr}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    // Add color stops to the gradient
    gradient.append('stop').attr('offset', '0%').attr('stop-color', colorScale(start));

    gradient.append('stop').attr('offset', '50%').attr('stop-color', colorScale(midPoint));

    gradient.append('stop').attr('offset', '100%').attr('stop-color', colorScale(end));

    // Remove existing legend elements
    svg.selectAll('.color_legend').remove();

    // Append a rectangle filled with the color gradient
    svg
      .append('rect')
      .attr('class', 'color_legend')
      .attr('transform', `translate(${margin.left}, ${graph_length + margin.top + 10})`)
      .attr('width', graph_length)
      .attr('height', 5)
      .style('fill', `url(#colorGradient${attr})`);

    // Remove existing text legend elements
    svg.selectAll('.text_legend').remove();

    // Define the legend text
    const legendData = [start, midPoint, end];

    svg
      .selectAll('.text_legend')
      .data(legendData)
      .join('text')
      .attr('class', 'text_legend')
      .style('font-size', '10px')
      .text((d) => d)
      .attr('x', (d) =>
        d === midPoint
          ? graph_length / 2 + margin.left
          : d < midPoint
            ? margin.left
            : margin.left + graph_length
      )
      .attr('y', graph_length + margin.top + 25)
      .attr('text-anchor', (d) => (d === midPoint ? 'middle' : d < midPoint ? 'start' : 'end'))
      .attr('fill', 'black')
      .on('mousedown mouseup click', (e) => e.stopPropagation()); // Combined event listeners
  }

  // ############################## AUX ##############################

  generateText(data) {
    let vis = this;
    const decimals = MATRIX_TOOLTIP_DECIMALS;

    const color = vis.color_scale(data.value);
    const measure = 'measure';

    let text = `<div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <div style="width: 50px; height: 50px; background-color: ${color};"></div>`;

    if (data.z_value !== undefined) {
      text += `<div>Z-Score: ${data.z_value.toFixed(decimals)}<br>`;
    }
    if (data.mean_1 !== undefined && data.std_1 !== undefined) {
      text +=
        `Study ${measure}: ${data.mean_1.toFixed(decimals)} ±` + `${data.std_1.toFixed(decimals)}`;
    }
    if (data.mean_2 !== undefined && data.std_2 !== undefined) {
      text +=
        `<br>Control ${measure}: ${data.mean_2.toFixed(decimals)} ±` +
        `${data.std_2.toFixed(decimals)}`;
    }

    text += `<br>ROIs: ${data.y_node}, ${data.x_node} </div>`;
    //text += `<br>x: ${data.x_index}, y: ${data.y_index}`;

    return text;
  }

  setNodeColors() {
    let vis = this;
    const base_atlas = store.getState().atlas.selected_atlas;

    const lobule_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.lobule)));

    vis.lobules = lobule_names;
    vis.colors = ['#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf'];

    vis.lobule_colors = {};
    for (var i = 0; i < vis.lobules.length; i++) {
      vis.lobule_colors[vis.lobules[i]] = vis.colors[i];
    }
  }

  setSize() {
    let vis = this;

    vis.scale_space = 40; // a little of space for the color scale
    vis.width = SQUARE_LENGTH - vis.margin.left;
    vis.height = SQUARE_LENGTH - vis.margin.top;
    vis.graph_length = Math.floor(SQUARE_LENGTH - vis.margin.top - vis.scale_space);
  }

  filterZoomNodes() {
    let vis = this;

    const x_present_rois = vis.links.map((link) => link.x_node);
    vis.x_nodes = vis.x_nodes.filter((acronim) => x_present_rois.includes(acronim));

    const y_present_rois = vis.links.map((link) => link.y_node);
    vis.y_nodes = vis.y_nodes.filter((acronim) => y_present_rois.includes(acronim));
  }

  zoomSelectedNodes() {
    let vis = this;
    if (vis.selected_nodes.x_nodes.length === 0 || vis.selected_nodes.y_nodes.length === 0) {
      console.error('ERROR: At least 1 node per axis');
      return;
    } else {
      vis.zoom_list.push(utils.getCopy({ x_nodes: vis.x_nodes, y_nodes: vis.y_nodes }));
      const x_nodes = vis.data.nodes
        .map((node) => node.acronim)
        .filter((node) => vis.selected_nodes.x_nodes.includes(node));
      const y_nodes = vis.data.nodes
        .map((node) => node.acronim)
        .filter((node) => vis.selected_nodes.y_nodes.includes(node));

      const nodes = { x_nodes, y_nodes };

      vis.zoomNodes(nodes);
    }
  }

  zoomNodes(nodes) {
    let vis = this;

    vis.reset = false;
    vis.x_nodes = nodes.x_nodes;
    vis.y_nodes = nodes.y_nodes;
    vis.chart.call(vis.brush.move, null);
    vis.chart.call(vis.brush);
    vis.updateVis();
  }

  divideMatrix() {
    let vis = this;

    vis.links = vis.data.links.filter((cell) => {
      return (
        ((vis.original_scale(cell.x_node) > vis.original_scale(cell.y_node) && cell.value >= 0) ||
          (vis.original_scale(cell.x_node) < vis.original_scale(cell.y_node) && cell.value < 0)) &&
        vis.x_scale.domain().includes(cell.x_node) &&
        vis.y_scale.domain().includes(cell.y_node)
      );
    });
  }

  filterLinks() {
    let vis = this;
    vis.links = vis.data.links.filter(
      (cell) => vis.x_nodes.includes(cell.x_node) && vis.y_nodes.includes(cell.y_node)
    );
  }

  initData(data) {
    let vis = this;

    vis.data = data;
    vis.attr = data.attr;
    const nodes = vis.data.nodes.map((roi) => {
      return roi.acronim;
    });
    vis.original_scale.range([0, vis.graph_length]).domain(nodes);

    if (!vis.x_nodes || vis.atlas !== data.atlas) {
      vis.x_nodes = nodes;
      vis.y_nodes = vis.x_nodes;
    }
    vis.matrix_max_value = vis.data.max;
    vis.matrix_min_value = vis.data.min;
    vis.filterLinks();
    vis.generateColorScale();
  }

  zoomSelectedLinks() {
    let vis = this;
    const selected_links = store.getState().matrix.links;
    vis.zoom_list.push(utils.getCopy({ x_nodes: vis.x_nodes, y_nodes: vis.y_nodes }));
    const selected_x_nodes = [...new Set(selected_links.map((link) => link.x_node))];
    const selected_y_nodes = [...new Set(selected_links.map((link) => link.y_node))];

    const x_nodes = vis.data.nodes
      .map((node) => node.acronim)
      .filter((node) => selected_x_nodes.includes(node));
    const y_nodes = vis.data.nodes
      .map((node) => node.acronim)
      .filter((node) => selected_y_nodes.includes(node));

    const nodes = { x_nodes, y_nodes };

    vis.zoomNodes(nodes);
  }

  drawSelectedLinks() {
    let vis = this;
    const selected_links = store.getState().matrix.links;

    vis.chart.selectAll('.matrix_cell').classed('selected', function (d) {
      return selected_links.some((link) => link.x_node == d.x_node && link.y_node == d.y_node);
    });

    vis.chart.selectAll('.matrix_cell.selected').raise();
    vis.chart.selectAll('.overlay').raise();
  }

  getIndex(position, axis, round) {
    let vis = this;
    const band_width = axis === 'x' ? vis.y_scale.bandwidth() : vis.x_scale.bandwidth();
    const round_func = round ? Math.round : Math.floor;
    const index = round_func(position / band_width);
    return index;
  }
}
