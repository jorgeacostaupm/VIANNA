import { pubsub } from '@/components/VAPUtils/pubsub';

import {
  hierarchy,
  select,
  drag,
  zoom,
  zoomIdentity,
  zoomTransform,
  tree,
  pointer,
  linkHorizontal,
  linkVertical
} from 'd3';

import { setNavioColumns } from '@/components/VAPUtils/features/data/dataSlice';
import {
  changeRelationship,
  setNavioColumns,
  toggleAttribute
} from '@/components/VAPUtils/features/metadata/metaSlice';

import store from '@/components/VAPUtils/features/store';
let { publish, subscribe } = pubsub;

const margins = {
  top: 500,
  left: 0,
  right: 0,
  bottom: 0
};
const transitionDuration = 500;
const gridSize = 20;
const assignRadius = 30;

const maxString = 30;
const horizontalDistance = maxString * 10;

class EditorZone {
  containerRef; // Reference to the current SVG container

  // SVG Props
  dims;

  // Data Fields
  data;
  root;

  // Shortcuts to svg elements
  svg; // Reference to the current SVG
  main; // Reference to the main hierarchy container
  back; // Reference to the grid
  nodes; // Reference to the
  links;

  // Graph States
  dragStarted = false;
  selectedNode = null;
  draggingNode = [];

  backgroundOn = false;
  inspectedNode = null;

  // Behaviours
  zoomBehaviour = null;
  currentTransform = { x: 0, y: 0, k: 0 };

  // Brush
  brushBehaviour = null;

  // Spacing variables
  longestString = 0;
  nNodes = 0;

  // Visual Clues
  currentHighlightPath = null;

  // Create object and builds the initial visualization
  constructor(container, data, dispatcher) {
    this.containerRef = container;
    this.dispatcher = dispatcher; // Function used to dispatch events to the store

    const that = this;

    const { width, height } = container.getBoundingClientRect();
    this.dims = {
      width: width - margins.left - margins.right,
      height: height - margins.bottom - margins.top
    };

    this.width = width;
    this.height = height;
    this.data = data;
    this.root = hierarchy(data);
    this.initHierarchy();

    this.svg = select(this.containerRef).select('svg').node()
      ? select(this.containerRef).select('svg')
      : select(this.containerRef).append('svg').lower();

    this.svg = this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'move')
      .attr('viewBox', [0, 0, width, height]);

    this.svg.on('contextmenu', (event, node) => {
      publish('untoggleEvent', {});
      publish('closeResultsEvent', {});
      publish('closeOptionMenu', {});

      event.preventDefault();
    });

    this.svg.on('click', (event, node) => {
      event.preventDefault();
      event.stopPropagation();
      publish('untoggleEvent', {});
      publish('closeResultsEvent', {});
      publish('closeOptionMenu', {});
    });

    this.back = this.svg.select('pattern#grid-pattern').node()
      ? this.svg.select('pattern#grid-pattern')
      : this.svg.append('pattern').attr('id', 'grid-pattern');

    /* this.setBackgroundMesh(); */

    // Init Object Container
    this.main = this.svg.select('g#main-container').node()
      ? this.svg.select('g#main-container')
      : this.svg.append('g').attr('id', 'main-container');

    this.main.attr('transform', `translate(${width / 8},${height / 2.5})`);

    /*     this.svg
      .select("g#main-container")
      .attr("transform", "translate(" + 0 + "," + 400 + ")"); */

    // draw first the links so they are in the background
    const glink = this.main.select('g#links').node()
      ? this.main.select('g#links')
      : this.main.append('g').attr('id', 'links');

    const gnode = this.main.select('g#nodes').node()
      ? this.main.select('g#nodes')
      : this.main.append('g').attr('id', 'nodes');

    // gnode
    // .attr("cursor", "pointer")
    // .attr("pointer-event", "all")

    glink
      .attr('fill', 'none')
      .attr('stroke', 'grey')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 0.5);

    //this.drawHierarchy(this.root, false);

    // Adding behaviours
    this.zoomBehaviour = zoom()
      .scaleExtent([0.1, 5])
      .translateExtent([
        [-5000, -100000],
        [100000, 100000]
      ])
      .on('zoom', (event) => that.onGeneralZoom(event));

    this.svg.call(this.zoomBehaviour);

    subscribe('zoomInteractionEvent', ({ zoomRelative, zoomAbsolute, resetPosition }) => {
      const { svg, zoomBehaviour, currentTransform, dimensions } = this;
      if (resetPosition) {
        svg
          .transition()
          .duration(transitionDuration)
          .call(zoomBehaviour.transform, zoomIdentity, zoomTransform(svg.node()).invert([0, 0]));
      } else if (zoomRelative) {
        svg.transition().duration(transitionDuration).call(zoomBehaviour.scaleBy, zoomRelative);
      } else if (zoomAbsolute) {
        svg
          .transition()
          .duration(transitionDuration)
          .call(
            zoomBehaviour.transform,
            zoomIdentity.translate([currentTransform.x, currentTransform.y]).scale(zoomAbsolute)
          );
      }
    });

    subscribe('focusNode', ({ nodeId, inspect }) => {
      const node = this.root.descendants().filter((d) => d.id === nodeId);
      if (node == null || node.length == 0) {
        return;
      }

      // Focus Node
      this.svg.call(
        this.zoomBehaviour.transform,
        zoomIdentity.translate(-node[0].y, -node[0].x + this.dims.height / 2)
      );
      if (inspect) {
        this.inspectNode(node[0]);
      }
    });

    subscribe('inspectViewNode', ({ nodeId }) => {
      const node = this.root.descendants().filter((d) => d.id === nodeId);
      this.inspectNode(node[0]);
    });

    subscribe('modifyNodeInfo', ({ node }) => {
      const nodes = this.root.descendants();

      const text =
        node.name.length < maxString ? node.name : node.name.slice(0, maxString - 1) + '...';
      this.main
        .select('#nodes')
        .selectAll('g')
        .data(nodes, (node) => node.id)
        .filter((d) => d.data.id == node.id)
        .selectAll('text')
        .text(text);
    });

    /* window.addEventListener('resize', () => {
      this.setSize();
    }); */
  }

  setSize() {
    this.parentRect = this.containerRef.getBoundingClientRect();
    const width = this.parentRect.width;
    const height = this.parentRect.height;
    this.onResize({ width, height });
  }

  inspectNode(source) {
    if (source == null) return;
    this.inspectedNode = source;
    publish('nodeInspectionNode', { nodeId: source.id });
  }

  initHierarchy() {
    const { root, dims } = this;

    let maxLength = 0;
    let numberNodes = 0;

    root.x0 = dims.height / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = d.data.id;
      if (d.children == null) {
        d.children = [];
      }
      d._children = null;
      if (d.height === 0) {
        d.children = null;
      }

      if (d.data.isShown) {
        d.children = d.children;
        d._children = null;
      } else {
        d._children = d.children;
        d.children = null;
      }

      maxLength = Math.max(maxLength, d.data.name.length);
      numberNodes += 1;
    });
    this.longestString = maxLength;
    this.nNodes = numberNodes;
  }

  setBackgroundMesh() {
    this.back
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', gridSize)
      .attr('height', gridSize);
    this.back
      .append('line')
      .attr('stroke', '#a4a4a4')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', gridSize * 16)
      .attr('y2', 0);
    this.back
      .append('line')
      .attr('stroke', '#a4a4a4')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', gridSize * 16);

    const background = this.svg.select('.background').node()
      ? this.svg.select('.background')
      : this.svg.append('rect').attr('class', 'background');

    background
      .attr('x', -this.dims.width / 4)
      .attr('fill', 'url(#grid-pattern)')
      .attr('width', this.dims.width)
      .attr('height', this.dims.height);
  }

  drawHierarchy(source, instant = false) {
    const { root, dims, longestString } = this;
    const usedHeight = Math.max(dims.height, root.leaves().length * 200);
    const treeLayout = tree().size([usedHeight, dims.width]).nodeSize([200, 10]);
    treeLayout(root);
    console.log('NODES', root.descendants());
    // Nodes are fixed in place
    root.descendants().forEach((node) => {
      if (node.parent && node.parent.id === 0) {
        node.y = node.depth * Math.min(longestString * 10, horizontalDistance);
      } else {
        node.y = node.depth * Math.min(longestString * 15, horizontalDistance);
      }
    });

    publish('updateNodeListEvent', { nodes: root.descendants() });
    this.drawNodes(source, instant);
    this.drawLinks(source, instant);
  }

  drawNodes(source, instant = false) {
    const { root, main } = this;
    const graph = this;

    const nodes = root.descendants();

    const gnode = main
      .select('#nodes')
      .selectAll('g')
      .data(nodes, (node) => node.data.name);

    const dragBehaviour = drag()
      .on('start', function (event, node) {
        console.log('start drag');
        if (node.id === graph.root.id) {
          return;
        }
        graph.dragStarted = true;
      })
      .on('drag', function (event, node) {
        if (node.id === graph.root.id) {
          return;
        }
        if (graph.dragStarted) {
          graph.draggingNode.push(node);
          graph.onInitialNodeDrag(node, this);
        }

        node.x += event.dx;
        node.y += event.dy;
        select(this).attr('transform', 'translate(' + node.x + ',' + node.y + ')');
      })
      .on('end', function (event, node) {
        let parent = graph.root;
        if (graph.selectedNode) {
          graph.onChangeHierarchy();
          parent = graph.selectedNode;
          if (graph.inspectedNode != null && graph.selectedNode.id === graph.inspectedNode.id) {
            //graph.inspectNode(graph.selectedNode);
          }
        }

        graph.selectedNode = null;
        graph.draggingNode = [];
        graph.getShowNodesNavio();
        graph.drawHierarchy(parent);
      });

    gnode
      .exit()
      .transition()
      .remove()
      .duration(instant ? 0 : transitionDuration)
      .attr('transform', `translate(${source.y}, ${source.x})`) // move node to parent
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0);

    // new nodes
    const nodeEnter = gnode
      .enter()
      .append('g')
      .call(dragBehaviour)
      .attr('transform', `translate(${source.y}, ${source.x})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('cursor', 'pointer')
      .on('click', (event, node) => {
        console.log('node clicked');
        if (event.defaultPrevented) {
          return;
        }
        if (node.children === undefined || node._children === undefined) {
          return;
        }

        const nChild = node.children
          ? node.children.length
          : node._children
            ? node._children.length
            : 0;

        graph.dispatcher(toggleAttribute({ attributeID: node.data.id }));

        if (node.children) {
          node._children = node.children;
          node.children = null;
        } else {
          node.children = node._children;
          node._children = null;
        }

        if (nChild > 0) {
          graph.drawHierarchy(node);
        }
        graph.getShowNodesNavio();
      })
      .on('mouseover', function (event, node) {
        // Build Path
        let path = [];
        const recursivePath = (n) => {
          path.push(n.data.id);
          if (n.parent != null) recursivePath(n.parent);
        };
        recursivePath(node);
        select('#nodes')
          .selectAll('g')
          .filter((d) => path.includes(d.id))
          .select('.showCircle')
          .attr('fill', '#f87171');

        select('#links')
          .selectAll('path')
          .filter((d) => path.includes(d.target.id))
          .attr('stroke', '#f87171')
          .attr('stroke-width', 3);
      })
      .on('mouseleave', (event, node) => {
        graph.currentHighlightPath = null;
        select('#nodes')
          .selectAll('g')
          .select('.showCircle')
          .attr('fill', (node) => {
            if (node._children?.length > 0) return 'white';
            if (node.data.type == 'aggregation') {
              if (node.data?.formula == '') return node._children?.length > 0 ? 'red' : 'pink';
              else return node._children?.length > 0 ? 'orange' : '#f4d398';
            }
            return node.data.type == 'attribute' ? '#1677ff' : '#94bcf3';
          })
          .attr('stroke', (node) => {
            if (node._children?.length == 0) return 'transparent';
            if (node.data.type == 'aggregation') {
              if (node.data?.formula == '') return node._children?.length > 0 ? 'red' : 'pink';
              else return node._children?.length > 0 ? 'orange' : '#f4d398';
            }
            return 'transparent';
          })
          .attr('stroke-width', 3);

        select('#links').selectAll('path').attr('stroke', 'grey').attr('stroke-width', 1);
      })
      .on('contextmenu', (event, node) => {
        const rect = this.containerRef.getBoundingClientRect();
        publish('toggleEvent', {
          node: node.data,
          position: { x: event.clientX - rect.left, y: event.clientY - rect.top }
        });
        event.preventDefault();
        event.stopPropagation();
      });

    nodeEnter
      .append('rect')
      .attr('height', 20)
      .attr('width', 150)
      .attr('fill', (node) => {
        if (node._children?.length > 0) return 'white';
        if (node.data.type == 'aggregation') {
          if (node.data?.formula == '') return node._children?.length > 0 ? 'red' : 'pink';
          else return node._children?.length > 0 ? 'orange' : '#f4d398';
        }
        return node.data.type == 'attribute' ? '#1677ff' : '#94bcf3';
      })
      .attr('stroke', (node) => {
        if (node._children?.length == 0) return 'transparent';
        if (node.data.type == 'aggregation') {
          if (node.data?.formula == '') return node._children?.length > 0 ? 'red' : 'pink';
          else return node._children?.length > 0 ? 'orange' : '#f4d398';
        }
        return 'transparent';
      })
      .attr('stroke-width', 3);

    nodeEnter
      .append('circle')
      .attr('class', 'ghostCircle')
      .attr('r', assignRadius)
      .attr('opacity', 0.2)
      .attr('fill', 'red')
      .attr('fill-opacity', 0)
      .attr('pointer-events', 'all')
      .on('mouseover', function (event, node) {
        if (
          graph.draggingNode.length > 0 &&
          graph.draggingNode.filter((n) => n.id !== node.id).length > 0
        ) {
          select(this).attr('fill-opacity', 0.5);
          graph.selectedNode = node;
        }
      })
      .on('mouseout', function (event, node) {
        if (
          graph.draggingNode.length > 0 &&
          graph.draggingNode.filter((n) => n.id !== node.id).length > 0
        ) {
          graph.selectedNode = null;
        }
        select(this).attr('fill-opacity', 0);
      });

    nodeEnter
      .append('text')
      .attr('text-anchor', (node) =>
        node.id === graph.root.id
          ? 'end'
          : node.children && node.children.length >= 2
            ? 'middle'
            : 'start'
      )
      .style('font-size', '24px')
      .text((node) =>
        node.data.name.length < maxString
          ? node.data.name
          : node.data.name.slice(0, maxString - 1) + ' ...'
      )
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 2)
      .attr('paint-order', 'stroke');

    // modified
    const newNodeTranstion = gnode
      .merge(nodeEnter)
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr('transform', (node) => `translate(${node.x - 75},${node.y})`) // move node away from the parent
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1);

    newNodeTranstion
      .select('text')
      .attr('x', (node) => {
        if (node.id === graph.root.id) {
          return -20;
        }
        return 0;
      })
      .attr('y', (node) => {
        if (node.id === graph.root.id) {
          return -30;
        }
        return 15;
      })
      .attr('text-anchor', 'start');

    // graph.currentHighlightPath != null && graph.currentHighlightPath.includes(node.data.id) ? '#f87171':
    /* newNodeTranstion
      .select('circle')
      .attr('fill', (node) => (node.children ? '#1677ff' : '#94bcf3')); */
  }

  drawLinks(source, instant = false) {
    const { root, main } = this;
    const links = root.links();

    // modified
    const diagonal = linkVertical()
      .x((link) => link.x)
      .y((link) => link.y);

    const glink = main
      .select('#links')
      .selectAll('path')
      .data(links, (link) => link.target.id);

    const enterLinks = glink
      .enter()
      .append('path')
      .attr('stroke', 'grey')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1)
      .attr('d', (d) => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      });

    glink
      .merge(enterLinks)
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr('d', diagonal);

    glink
      .exit()
      .transition()
      .remove()
      .duration(instant ? 0 : transitionDuration)
      .attr('d', (d) => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });
  }

  onInitialNodeDrag(node) {
    const nodes = node.descendants();
    this.main // This allows the mouseover action to be executed
      .select('#nodes')
      .selectAll('g')
      .sort(function (a, b) {
        return a.id !== node.id ? 1 : -1;
      });

    if (nodes.length > 1) {
      const links = node.links();
      this.main
        .select('#links')
        .selectAll('path')
        .data(links, (link) => link.target.id)
        .remove();

      this.main
        .select('#nodes')
        .selectAll('g')
        .data(nodes, (node) => node.id)
        .filter((n) => n.id !== node.id)
        .remove();
    }

    const parentLinks = node.parent.links();
    this.main
      .select('#links')
      .selectAll('path')
      .data(parentLinks, (link) => link.target.id)
      .filter((link) => link.target.id === node.id)
      .remove();

    this.dragStarted = false;
  }

  onChangeHierarchy() {
    const targetID = this.selectedNode.data.id;
    const sourceIDs = this.draggingNode.map((n) => n.id);
    this.dispatcher(
      changeRelationship({
        source: sourceIDs[0],
        target: targetID,
        recover: true
      })
    );
  }
  // When the user drags the whole editor zone and not a specific node
  onGeneralZoom(e) {
    const { back, main } = this;
    /*     back
      .attr("x", event.transform.x)
      .attr("y", event.transform.y)
      .attr("width", gridSize * event.transform.k)
      .attr("height", gridSize * event.transform.k); */

    this.main.attr(
      'transform',
      e.transform + ' ' + `translate(${this.width / 8},${this.height / 2.5})`
    );

    /* main.select("#nodes").attr("transform", event.transform);
    main.select("#links").attr("transform", event.transform); */
  }

  getShowNodesNavio() {
    let attributes = [];
    const addAttribute = (n) => {
      if (n.data.id !== 0 && n.children == null) attributes.push(n.data.name);

      if (n._children != null) return;
      if (n.children != null) n.children.forEach(addAttribute);
    };

    this.root.children?.forEach(addAttribute); // TODO dont add parent
    const attrs = store.getState().metadata.attributes;
    const columns = attributes.filter((attr) => {
      const complete_attr = attrs.find((a) => a.name === attr);
      if (complete_attr.type != 'aggregation') return true;
      if (complete_attr.info?.exec) return true;
    });
    //this.dispatcher(setNavioColumns(columns));
  }

  updateData(newData, sourceId = null) {
    this.setSize();
    this.data = newData;
    this.root = hierarchy(newData);
    this.initHierarchy();

    let source;
    if (sourceId != null) {
      const nodes = this.root.descendants().filter((d) => d.id == sourceId);
      source = nodes && nodes.length > 0 ? nodes[0] : this.root;
    } else {
      source = this.root;
    }
    /*     if (this.inspectedNode) {
      this.inspectedNode = this.root.descendants().find((n) => n.id === this.inspectedNode.id);
      this.inspectNode(this.inspectedNode);
    } */

    this.drawHierarchy(this.root);

    this.getShowNodesNavio();
  }

  onResize(newDim) {
    if (newDim === null) {
      return;
    }
    const { width, height } = newDim;
    select(this.containerRef).selectAll('svg').attr('width', width).attr('height', height);

    this.dims.width = width - margins.left - margins.right;
    this.dims.height = height - margins.top - margins.bottom;
    this.svg
      .select('.background')
      .attr('width', this.dims.width)
      .attr('height', this.dims.height)
      .attr('x', -this.dims.width / 8);

    this.drawHierarchy(this.root, true);
  }
}

export default EditorZone;
