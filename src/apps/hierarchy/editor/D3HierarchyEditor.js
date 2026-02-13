import * as d3 from "d3";
import { CHART_OUTLINE, CHART_OUTLINE_MUTED } from "@/utils/chartTheme";

import { setNavioColumns } from "@/store/slices/dataSlice";
import { aggregateSelectedNodes, changeOrder } from "@/store/slices/metaSlice";
import {
  changeRelationship,
  removeAttribute,
  toggleAttribute,
} from "@/store/async/metaAsyncReducers";
import store from "@/store/store";

import { pubsub } from "@/utils/pubsub";
import { DataType } from "@/utils/Constants";
import { fixTooltipToNode, getRandomInt } from "@/utils/functions";
import {
  extractErrorMessage,
  formatListPreview,
  notify,
  notifyError,
  notifyInfo,
  notifyWarning,
} from "@/utils/notifications";

let { publish, subscribe, unsubscribe } = pubsub;

const dtypeColors = {
  [DataType.NUMERICAL.dtype]: DataType.NUMERICAL.color,
  [DataType.TEXT.dtype]: DataType.TEXT.color,
  [DataType.UNKNOWN.dtype]: DataType.UNKNOWN.color,
  root: "white",
};

function colorNode(node) {
  if (node?.data?.isActive === false) {
    return "var(--color-surface-muted)";
  }
  const dtype = node.data?.dtype || "none";
  return dtypeColors[dtype];
}

const transitionDuration = 800;
const nodeHalfSize = 12.5;
const nodeCornerRadius = 4;
const triangleTopFactor = 1.152;
const triangleBottomFactor = 0.576;
const assignRadius = 40;
const allowedLinkStyles = new Set(["smooth", "elbow", "straight"]);
const defaultViewConfig = Object.freeze({
  nodeSize: 60,
  depthSpacing: 240,
  nodeScale: 1,
  labelFontSize: 24,
  labelMaxLength: 20,
  linkWidth: 1,
  showLabels: true,
});

const clampNumber = (value, min, max, fallback) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
};

const getNodeLabel = (node) =>
  node?.data?.name || node?.name || `Node #${node?.id ?? "unknown"}`;

export default class D3HierarchyEditor {
  orientation = "vertical";
  linkStyle = "smooth";
  viewConfig = defaultViewConfig;
  targetNode = null;
  nodesDragged = [];
  navioSyncTimeout = null;
  subscriptionHandlers = {};

  constructor(container, data, dispatcher, options = {}) {
    this.containerRef = container;
    this.dispatcher = dispatcher;
    this.viewConfig = this.normalizeViewConfig(options.viewConfig);

    if (options.orientation) this.setOrientation(options.orientation);
    if (options.linkStyle) this.setLinkStyle(options.linkStyle);

    this.descriptions = store.getState().cantab.present.descriptions;
    this.dims = container.getBoundingClientRect();

    this.width = this.dims.width;
    this.height = this.dims.height;
    this.data = data;

    this.svg = d3.select(this.containerRef);

    this.svg.on("contextmenu", (event) => {
      publish("untoggleEvent", {});
      publish("closeResultsEvent", {});
      publish("closeOptionMenu", {});

      event.preventDefault();
    });

    this.svg
      .on("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        publish("untoggleEvent", {});
        publish("closeResultsEvent", {});
        publish("closeOptionMenu", {});
      })
      .on("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.svg.selectAll(".showCircle").classed("selectedNode", false);
      });

    this.brush = this.getBrush();

    d3.select(window).on("keydown", (event) => {
      if (event.key === "b" || event.key === "B") {
        this.activateBrushSelection();
      }
    });

    this.main = this.svg.select("g#main-container").node()
      ? this.svg.select("g#main-container")
      : this.svg.append("g").attr("id", "main-container");

    const baseTransform = this.getBaseTransform();

    this.zoomBehaviour = d3
      .zoom()
      .scaleExtent([0.1, 1])
      .translateExtent([
        [-18000, -18000],
        [18500, 18500],
      ])
      .on("zoom", (e) => {
        this.main.attr("transform", e.transform);
      });

    this.main.attr("transform", baseTransform);
    this.svg
      .call(this.zoomBehaviour)
      .call(this.zoomBehaviour.transform, baseTransform);

    const glink = this.main.select("g#links").node()
      ? this.main.select("g#links")
      : this.main.append("g").attr("id", "links");

    this.main.select("g#nodes").node()
      ? this.main.select("g#nodes")
      : this.main.append("g").attr("id", "nodes");

    glink
      .attr("fill", "none")
      .attr("stroke", CHART_OUTLINE_MUTED)
      .attr("stroke-opacity", 1)
      .attr("stroke-width");
    this.addSubscriptions();

    this.tooltip = d3.select("body").select("div.tooltip");
    if (this.tooltip.empty()) {
      this.tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    this.update(data);
  }

  isHorizontal() {
    return this.orientation !== "vertical";
  }

  projectPoint(x, y) {
    return this.isHorizontal() ? { x: y, y: x } : { x, y };
  }

  getNodeTransform(node, usePrevious = false) {
    const nx = usePrevious ? (node.x0 ?? node.x) : node.x;
    const ny = usePrevious ? (node.y0 ?? node.y) : node.y;
    const { x, y } = this.projectPoint(nx, ny);
    return `translate(${x}, ${y})`;
  }

  getLinkPath(link) {
    const [sx, sy, tx, ty] = this.getProjectedLinkCoords(link);

    if (this.linkStyle === "straight") {
      return `M${sx},${sy}L${tx},${ty}`;
    }

    if (this.linkStyle === "elbow") {
      const midX = (sx + tx) / 2;
      return `M${sx},${sy}L${midX},${sy}L${midX},${ty}L${tx},${ty}`;
    }

    const controlPointX = sx + (tx - sx) * 0.5;
    return `M${sx},${sy}C${controlPointX},${sy} ${controlPointX},${ty} ${tx},${ty}`;
  }

  getProjectedLinkCoords(link) {
    if (this.isHorizontal()) {
      return [link.source.y, link.source.x, link.target.y, link.target.x];
    }

    return [link.source.x, link.source.y, link.target.x, link.target.y];
  }

  getLogicalDelta(dx, dy) {
    if (this.isHorizontal()) {
      return { x: dy, y: dx };
    }
    return { x: dx, y: dy };
  }

  getBaseTransform(scale = 0.8) {
    if (this.isHorizontal()) {
      return d3.zoomIdentity
        .translate(this.width / 8, this.height / 2)
        .scale(scale);
    }

    return d3.zoomIdentity
      .translate(this.width / 2, this.height / 3)
      .scale(scale);
  }

  normalizeViewConfig(viewConfig = {}) {
    return {
      nodeSize: clampNumber(
        viewConfig.nodeSize,
        36,
        140,
        defaultViewConfig.nodeSize,
      ),
      depthSpacing: clampNumber(
        viewConfig.depthSpacing,
        120,
        420,
        defaultViewConfig.depthSpacing,
      ),
      nodeScale: clampNumber(
        viewConfig.nodeScale,
        0.6,
        1.8,
        defaultViewConfig.nodeScale,
      ),
      labelFontSize: clampNumber(
        viewConfig.labelFontSize,
        12,
        40,
        defaultViewConfig.labelFontSize,
      ),
      labelMaxLength: clampNumber(
        viewConfig.labelMaxLength,
        8,
        60,
        defaultViewConfig.labelMaxLength,
      ),
      linkWidth: clampNumber(
        viewConfig.linkWidth,
        1,
        6,
        defaultViewConfig.linkWidth,
      ),
      showLabels:
        typeof viewConfig.showLabels === "boolean"
          ? viewConfig.showLabels
          : defaultViewConfig.showLabels,
    };
  }

  getNodeHalfSize() {
    return nodeHalfSize * this.viewConfig.nodeScale;
  }

  getNodeCornerRadius() {
    return nodeCornerRadius * this.viewConfig.nodeScale;
  }

  getNodeTrianglePath() {
    const halfSize = this.getNodeHalfSize();
    const top = -(halfSize * triangleTopFactor);
    const bottom = halfSize * triangleBottomFactor;
    return `M 0 ${top} L ${halfSize} ${bottom} L ${-halfSize} ${bottom} Z`;
  }

  getAssignRadius() {
    return assignRadius * this.viewConfig.nodeScale;
  }

  getLabelOffset() {
    return -(this.getNodeHalfSize() + 15.5);
  }

  getLabelText(node) {
    const label = node?.data?.name ?? "";
    const maxLength = Math.round(this.viewConfig.labelMaxLength);
    if (label.length <= maxLength) return label;
    return `${label.slice(0, Math.max(1, maxLength - 1))}...`;
  }

  setViewConfig(viewConfig) {
    const nextViewConfig = this.normalizeViewConfig(viewConfig);
    const hasChanges = Object.keys(defaultViewConfig).some(
      (key) => this.viewConfig[key] !== nextViewConfig[key],
    );

    if (!hasChanges) return;

    this.viewConfig = nextViewConfig;

    if (!this.root) return;

    this.drawHierarchy(this.root, true);
  }

  setOrientation(orientation) {
    const nextOrientation =
      orientation === "vertical" ? "vertical" : "horizontal";

    if (this.orientation === nextOrientation) return;

    this.orientation = nextOrientation;
    const baseTransform = this.getBaseTransform();

    if (this.main && this.zoomBehaviour && this.svg) {
      this.main.attr("transform", baseTransform);
      this.svg.call(this.zoomBehaviour.transform, baseTransform);
    }

    if (!this.root) return;

    const crossSize = this.isHorizontal() ? this.dims.height : this.dims.width;
    this.root.x0 = crossSize / 2;
    this.root.y0 = 0;

    this.drawHierarchy(this.root, true);
  }

  setLinkStyle(linkStyle) {
    const nextLinkStyle = allowedLinkStyles.has(linkStyle)
      ? linkStyle
      : "smooth";

    if (this.linkStyle === nextLinkStyle) return;

    this.linkStyle = nextLinkStyle;

    if (!this.root) return;

    this.drawLinks(this.root);
  }

  activateBrushSelection() {
    if (!this.svg || !this.brush) return;
    this.svg.selectAll(".brush").remove();
    this.svg.append("g").attr("class", "brush").call(this.brush);
  }

  setSize() {
    this.parentRect = this.containerRef.getBoundingClientRect();
    const width = this.parentRect.width;
    const height = this.parentRect.height;
    this.onResize({ width, height });
  }

  initHierarchy() {
    const { root, dims } = this;

    let maxLength = 0;
    this.nNodes = 0;

    const crossSize = this.isHorizontal() ? dims.height : dims.width;
    root.x0 = crossSize / 2;
    root.y0 = 0;
    root.descendants().forEach((d) => {
      d.id = d.data.id;
      if (d.children == null) {
        d.children = [];
      }
      d._children = null;
      if (d.height === 0) {
        d.children = null;
      }

      if (d.data.isShown) {
        d._children = null;
      } else {
        d._children = d.children;
        d.children = null;
      }

      maxLength = Math.max(maxLength, d.data.name.length);
      this.nNodes += 1;
    });
  }

  update(newData) {
    this.setSize();
    this.data = newData;
    this.root = d3.hierarchy(newData);
    this.initHierarchy();
    this.drawHierarchy(this.root, true);
    this.setNavioNodes();
  }

  drawHierarchy(source, instant = false) {
    const { root } = this;
    const siblingSpacing = this.viewConfig.nodeSize;
    const treeLayout = d3.tree().nodeSize([siblingSpacing, siblingSpacing]);
    treeLayout(root);

    root.descendants().forEach((node) => {
      node.y = node.depth * this.viewConfig.depthSpacing;
    });

    this.drawNodes(source, instant);
    this.drawLinks(source, instant);

    root.each((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  drawNodes(source, instant = false) {
    const { root, main } = this;
    const graph = this;
    const transitionTime = instant ? 0 : transitionDuration;

    const nodes = root.descendants();

    const dragBehaviour = this.getDragBehaviour();

    const gnode = main
      .select("#nodes")
      .selectAll(".circleG")
      .data(nodes, (d) => d.data.dtype + d.data.name + d.children + d._children)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "circleG")
            .attr("transform", () => this.getNodeTransform(source, true))
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

          this.addNodeEvents(g);

          g.call(dragBehaviour);

          g.each(function (d) {
            const group = d3.select(this);
            const { type } = d.data;
            const nChildren =
              (d.children?.length ?? 0) + (d._children?.length ?? 0);
            const fill = colorNode(d);
            const halfSize = graph.getNodeHalfSize();

            if (type === "aggregation" && nChildren === 0) {
              group
                .append("path")
                .attr("class", "showCircle")
                .attr("d", graph.getNodeTrianglePath())
                .attr("fill", fill);
            } else if (type === "aggregation" || type === "root") {
              group
                .append("rect")
                .attr("class", "showCircle")
                .attr("x", -halfSize)
                .attr("y", -halfSize)
                .attr("width", halfSize * 2)
                .attr("height", halfSize * 2)
                .attr("rx", graph.getNodeCornerRadius())
                .attr("fill", fill);
            } else {
              group
                .append("circle")
                .attr("class", "showCircle")
                .attr("r", halfSize)
                .attr("fill", fill);
            }

            if (d._children && !d.children) {
              group
                .select(".showCircle")
                .attr("stroke", CHART_OUTLINE)
                .attr("stroke-width", 2 * graph.viewConfig.nodeScale);
            }
          });

          g.append("circle")
            .attr("class", "ghostCircle")
            .attr("r", this.getAssignRadius())
            .attr("opacity", 0.2)
            .attr("fill", "var(--color-brand)")
            .attr("fill-opacity", 0)
            .attr("pointer-events", "all")
            .on("mouseover", function (event, node) {
              // si arrastramos nodos hacia un nodo, comprobamos que la id sea diferente
              if (
                graph.nodesDragged.length > 0 &&
                graph.nodesDragged.filter((n) => n.id !== node.id).length ===
                  graph.nodesDragged.length
              ) {
                d3.select(this).attr("fill-opacity", 0.5);
                graph.targetNode = node;
              }
            })
            .on("mouseout", function (event, node) {
              if (
                graph.nodesDragged.length &&
                !graph.nodesDragged.some((n) => n.id === node.id)
              ) {
                graph.targetNode = null;
              }
              d3.select(this).attr("fill-opacity", 0);
            });

          g.append("text")
            .attr("dy", "0.3em")
            .attr("x", 0)
            .attr("y", this.getLabelOffset())
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.round(this.viewConfig.labelFontSize)}px`)
            .text((node) => graph.getLabelText(node))
            .style("fill", "var(--color-ink)")
            .style("stroke", "var(--color-surface)")
            .style("stroke-width", 3)
            .style("stroke-linejoin", "round")
            .style("paint-order", "stroke");

          return g;
        },
        (update) => update,
        (exit) =>
          exit
            .transition()
            .duration(transitionTime)
            .attr("transform", () => this.getNodeTransform(source))
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .remove(),
      );

    const currentNodeHalfSize = this.getNodeHalfSize();
    const currentCornerRadius = this.getNodeCornerRadius();

    gnode.selectAll("circle.showCircle").attr("r", currentNodeHalfSize);
    gnode
      .selectAll("rect.showCircle")
      .attr("x", -currentNodeHalfSize)
      .attr("y", -currentNodeHalfSize)
      .attr("width", currentNodeHalfSize * 2)
      .attr("height", currentNodeHalfSize * 2)
      .attr("rx", currentCornerRadius);
    gnode.selectAll("path.showCircle").attr("d", this.getNodeTrianglePath());
    gnode.selectAll(".ghostCircle").attr("r", this.getAssignRadius());

    gnode
      .select(".showCircle")
      .attr("fill", (d) => colorNode(d))
      .attr("fill-opacity", (d) => (d.data?.isActive === false ? 0.55 : 1))
      .attr("stroke", (d) => {
        return (
          (d._children && !d.children) ||
          d.data?.type === "root" ||
          d.data?.id === 0
        )
          ? CHART_OUTLINE
          : "none";
      })
      .attr("stroke-width", 2 * this.viewConfig.nodeScale);

    gnode
      .transition()
      .duration(transitionTime)
      .attr("transform", (d) => this.getNodeTransform(d))
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    const isHorizontal = this.isHorizontal();

    gnode
      .select("text")
      .text((d) => this.getLabelText(d))
      .attr("x", 0)
      .attr("y", this.getLabelOffset())
      .attr("text-anchor", isHorizontal ? "middle" : "start")
      .attr("transform", isHorizontal ? null : "rotate(-25)")
      .style("font-size", `${Math.round(this.viewConfig.labelFontSize)}px`)
      .attr("stroke", "var(--color-surface)")
      .attr("display", this.viewConfig.showLabels ? null : "none")
      .style("fill", (d) =>
        d.data?.isActive === false
          ? "var(--color-ink-tertiary)"
          : "var(--color-ink)",
      )
      .attr("text-decoration", (d) =>
        d.data?.isActive === false ? "line-through" : null,
      );
  }

  drawLinks(source, instant = false) {
    const { root, main } = this;
    const links = root.links();

    const glink = main
      .select("#links")
      .selectAll("path")
      .data(links, (link) => link.target.id);

    const enterLinks = glink
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("stroke", CHART_OUTLINE_MUTED)
      .attr("stroke-opacity", 1)
      .attr("stroke-width", this.viewConfig.linkWidth)
      .attr("d", () => {
        const o = { x: source.x0 ?? source.x, y: source.y0 ?? source.y };
        return this.getLinkPath({ source: o, target: o });
      });

    glink
      .merge(enterLinks)
      .attr("stroke-width", this.viewConfig.linkWidth)
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr("d", (d) => this.getLinkPath(d));

    glink
      .exit()
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr("d", () => {
        const o = { x: source.x, y: source.y };
        return this.getLinkPath({ source: o, target: o });
      })
      .remove();
  }

  addNodeEvents(nodes) {
    const graph = this;

    nodes
      .on("mouseover", function (e, node) {
        if (graph.nodesDragged.length === 0) {
          graph.svg.style("cursor", "grab");
        }

        if (!node?.data?.desc || graph.onDrag) return;

        graph._tooltipNode = node;
        graph._tooltipTimer = setTimeout(() => {
          if (graph.onDrag || graph._tooltipNode !== node) return;

          graph.tooltip.html(node.data.desc);

          fixTooltipToNode(
            d3.select(this), // ⬅️ el g.circleG
            graph.tooltip,
          );
        }, 700);
      })
      .on("mouseleave", () => {
        graph.svg.style("cursor", "default");

        clearTimeout(graph._tooltipTimer);
        graph._tooltipTimer = null;
        graph._tooltipNode = null;

        graph.tooltip.style("visibility", "hidden");
      })
      .on("contextmenu", (event, node) => {
        const rect = this.containerRef.getBoundingClientRect();
        const selection = this.svg
          .selectAll(".showCircle.selectedNode")
          .filter((d) => d.id === node.id);

        const isSelectedNode = !selection.empty();

        const hasSelectedNodes =
          this.svg
            .selectAll(".circleG")
            .filter(function () {
              return d3
                .select(this)
                .select(".showCircle")
                .classed("selectedNode");
            })
            .size() > 0;

        publish("toggleEvent", {
          node,
          position: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
          isSelectedNode,
          hasSelectedNodes,
        });
        event.preventDefault();
        event.stopPropagation();
      });
  }

  getDragBehaviour() {
    const graph = this;

    return d3
      .drag()
      .on("start", function (event, node) {
        if (node.id === graph.root.id) return;

        graph._dragStartX = event.x;
        graph._dragStartY = event.y;
        graph._hasDragged = false;

        clearTimeout(graph._tooltipTimer);
        graph.tooltip.style("visibility", "hidden");
      })
      .on("drag", function (event, node) {
        // 1️⃣ Detectar si realmente es drag
        if (!graph._hasDragged) {
          const dx = Math.abs(event.x - graph._dragStartX);
          const dy = Math.abs(event.y - graph._dragStartY);

          if (dx < 5 && dy < 5) {
            return; // todavía es click
          }

          graph._hasDragged = true;
          graph.onDrag = true;

          const selectedNodes = graph.svg
            .selectAll(".circleG")
            .filter(function () {
              return d3
                .select(this)
                .select(".showCircle")
                .classed("selectedNode");
            })
            .data();

          graph.isMultiSelect =
            selectedNodes.length > 1 && selectedNodes.some((d) => d === node);

          graph.nodesDragged = graph.isMultiSelect ? selectedNodes : [node];

          graph.onInitialNodeDrag(node, graph.isMultiSelect);

          const parent = node.parent;

          if (parent && parent.children) {
            const siblings = parent.children.slice();

            const xs = siblings.map((s) => s.x);
            const ys = siblings.map((s) => s.y);
            graph._dragSiblingXPositions = xs;

            graph._dragSiblingMinX = Math.min(...xs);
            graph._dragSiblingMaxX = Math.max(...xs);
            graph._dragSiblingMinY = Math.min(...ys) - graph.viewConfig.depthSpacing;
            graph._dragSiblingMaxY = Math.max(...ys) + graph.viewConfig.depthSpacing;

            graph._dragOriginalIndex = graph._dragSiblingXPositions.indexOf(
              node.x,
            );
            graph._originalX = node.x;
            graph._currentHoverIndex = graph._dragOriginalIndex;
          }
        }

        graph.svg.style("cursor", "grabbing");

        const movingNodes = [node].flatMap((n) =>
          n.descendants ? n.descendants() : [n],
        );

        const { x: deltaX, y: deltaY } = graph.getLogicalDelta(
          event.dx,
          event.dy,
        );

        movingNodes.forEach((d) => {
          d.x += deltaX;
          d.y += deltaY;
        });

        graph.main
          .select("#nodes")
          .selectAll(".circleG")
          .filter((d) => movingNodes.some((mn) => mn.id === d.id))
          .attr("transform", (d) => graph.getNodeTransform(d))
          .lower();

        graph.main
          .select("#links")
          .selectAll("path")
          .filter((l) => {
            return (
              movingNodes.some((n) => n.id === l.source.id) &&
              movingNodes.some((n) => n.id === l.target.id)
            );
          })
          .attr("d", (l) => graph.getLinkPath(l));

        if (graph.nodesDragged.length === 1) {
          if (
            node.x < graph._dragSiblingMinX - 150 ||
            node.x > graph._dragSiblingMaxX + 150 ||
            node.y < graph._dragSiblingMinY ||
            node.y > graph._dragSiblingMaxY
          ) {
            graph.main
              .selectAll(".circleG")
              .classed("highlight-sibling", false);
          } else {
            const parent = node.parent;
            if (!parent || !parent.children) return;

            const siblings = parent.children.filter(
              (sib) => sib.id !== node.id,
            );

            if (siblings.length === 0) return;

            const sortedSiblings = siblings.slice().sort((a, b) => a.x - b.x);

            let leftSibling = null;
            let rightSibling = null;
            let newIndex = graph._dragOriginalIndex;

            for (let i = 0; i < sortedSiblings.length; i++) {
              if (node.x < sortedSiblings[i].x) {
                rightSibling = sortedSiblings[i];
                leftSibling = i > 0 ? sortedSiblings[i - 1] : null;
                newIndex = i;
                break;
              }
            }

            if (rightSibling === null) {
              leftSibling = sortedSiblings[sortedSiblings.length - 1];
              rightSibling = null;
              newIndex = sortedSiblings.length;
            }

            function rangeUnordered(a, b) {
              const start = Math.min(a, b);
              const end = Math.max(a, b);
              const result = [];

              for (let i = start; i <= end; i++) {
                result.push(i);
              }

              return result;
            }

            const range = rangeUnordered(newIndex, graph._dragOriginalIndex);
            parent.children.forEach((childNode, i) => {
              const subtree = childNode.descendants
                ? childNode.descendants()
                : [childNode];

              // Guardar posiciones originales si aún no están guardadas
              subtree.forEach((d) => {
                if (d._originalX === undefined) d._originalX = d.x;
                if (d._originalY === undefined) d._originalY = d.y;
              });

              if (i === graph._dragOriginalIndex) return;

              const moveLeft =
                range.includes(i) && i < graph._dragOriginalIndex;
              const moveRight =
                range.includes(i) && i > graph._dragOriginalIndex;

              if (moveLeft || moveRight) {
                const referenceIndex = moveLeft ? i + 1 : i - 1;
                const space = Math.abs(
                  childNode.x - graph._dragSiblingXPositions[referenceIndex],
                );

                subtree.forEach((d) => {
                  d.x += moveLeft ? space : -space;

                  graph.main
                    .selectAll(".circleG")
                    .filter((nodeD) => nodeD.id === d.id)
                    .attr("transform", graph.getNodeTransform(d));
                });

                graph.main
                  .select("#links")
                  .selectAll("path")
                  .filter(
                    (l) =>
                      subtree.some((n) => n.id === l.source.id) ||
                      subtree.some((n) => n.id === l.target.id),
                  )
                  .attr("d", (l) => graph.getLinkPath(l));
              } else {
                // Nodo que no debe moverse: restaurar posición original
                subtree.forEach((d) => {
                  d.x = d._originalX;
                  d.y = d._originalY;

                  graph.main
                    .selectAll(".circleG")
                    .filter((nodeD) => nodeD.id === d.id)
                    .attr("transform", graph.getNodeTransform(d));
                });

                // Recalcular enlaces para el subtree no movido
                graph.main
                  .select("#links")
                  .selectAll("path")
                  .filter(
                    (l) =>
                      subtree.some((n) => n.id === l.source.id) ||
                      subtree.some((n) => n.id === l.target.id),
                  )
                  .attr("d", (l) => graph.getLinkPath(l));
              }
            });

            // Actualizar nuevo índice y destacar los hermanos
            graph.newIndex = newIndex;

            graph.main
              .selectAll(".circleG")
              .classed("highlight-sibling", false)
              .filter(
                (d) => d.id === leftSibling?.id || d.id === rightSibling?.id,
              )
              .classed("highlight-sibling", true);
          }
        }
      })
      .on("end", function (event, node) {
        if (graph.targetNode) {
          // caso: reasignar nodo/nodos
          if (graph.nodesDragged.length === 1) graph.onChangeHierarchy();
          else graph.addSelectedNodes({ parent: graph.targetNode.id });
        } else if (graph.nodesDragged.length === 1 && graph.onDrag) {
          // caso: cambiar posicion de nodo

          const hasHighlightedSibling = !graph.main
            .selectAll(".circleG.highlight-sibling")
            .empty();

          if (hasHighlightedSibling) {
            graph.onChangeOrder(node, graph.newIndex);
          } else {
            graph.drawHierarchy(graph.root);
          }
          d3.select(this).select(".showCircle").classed("selectedNode", false);
          graph.main.selectAll(".circleG").style("display", "block");
          graph.main.selectAll(".link").style("display", "block");
          graph.main.selectAll(".circleG").classed("highlight-sibling", false);
        } else if (!graph.onDrag) {
          // caso: click
          graph.onNodeClick(node);
        } else {
          graph.drawHierarchy(graph.root, true);
          graph.main.selectAll(".circleG").style("display", "block");
          graph.main.selectAll(".link").style("display", "block");
          graph.main.selectAll(".circleG").classed("highlight-sibling", false);
        }
        graph.targetNode = null;
        graph.nodesDragged = [];
        graph.onDrag = false;
        graph.svg.style("cursor", "default");
      });
  }

  onInitialNodeDrag(node, isMultiSelect = false) {
    const nodesToMove = isMultiSelect
      ? this.svg
          .selectAll(".circleG")
          .filter(function () {
            return d3
              .select(this)
              .select(".showCircle")
              .classed("selectedNode");
          })
          .data()
      : [node];

    const descendants = nodesToMove.flatMap((n) =>
      n.descendants ? n.descendants() : [n],
    );

    if (isMultiSelect) {
      this.main
        .select("#nodes")
        .selectAll(".circleG")
        .filter(
          (d) =>
            descendants.some((sd) => sd.id === d.id) && d.id !== node.data.id,
        )
        .style("display", "none");

      this.main
        .select("#links")
        .selectAll("path")
        .filter((l) => {
          return (
            descendants.some((d) => d.id === l.source.id) ||
            descendants.some((d) => d.id === l.target.id)
          );
        })
        .style("display", "none");
    } else {
      this.main
        .select("#nodes")
        .selectAll(".circleG")
        .filter((d) => descendants.some((sd) => sd.id === d.id))
        .each(function () {
          this.parentNode.appendChild(this);
        });

      this.main
        .select("#links")
        .selectAll("path")
        .filter((l) => {
          return (
            descendants.some((d) => d.id === l.source.id) ||
            descendants.some((d) => d.id === l.target.id)
          );
        })
        .each(function () {
          this.parentNode.appendChild(this);
        });

      this.main
        .select("#links")
        .selectAll("path")
        .filter((l) => node.data.id === l.target.id)
        .style("display", "none");

      this.main
        .select("#nodes")
        .selectAll(".circleG")
        .filter((d) => descendants.some((sd) => sd.id === d.id))
        .classed("dragging-subtree", true);
    }
  }

  onNodeClick(node) {
    if (node.children === undefined || node._children === undefined) {
      return;
    }

    if (node.children) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }

    this.dispatcher(
      toggleAttribute({ attributeID: node.data.id, fromFocus: false }),
    );
    this.drawHierarchy(node);
    this.scheduleNavioSync(transitionDuration + 16);
  }

  scheduleNavioSync(delay = 0) {
    if (this.navioSyncTimeout) {
      clearTimeout(this.navioSyncTimeout);
    }

    this.navioSyncTimeout = setTimeout(() => {
      this.navioSyncTimeout = null;
      this.setNavioNodes();
    }, Math.max(0, delay));
  }

  initNodeDrag(node) {
    // se cogen los nodos que esten seleccionados
    this.nodesDragged = this.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const nodesToMove = this.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const descendants = nodesToMove.flatMap((n) =>
      n.descendants ? n.descendants() : [n],
    );

    this.main
      .select("#nodes")
      .selectAll(".circleG")
      .filter((d) => descendants.some((sd) => sd.id === d.id))
      .each(function () {
        this.parentNode.appendChild(this);
      });

    this.main
      .select("#links")
      .selectAll("path")
      .filter((l) => {
        return (
          descendants.some((d) => d.id === l.source.id) ||
          descendants.some((d) => d.id === l.target.id)
        );
      })
      .each(function () {
        this.parentNode.appendChild(this);
      });

    this.main
      .select("#nodes")
      .selectAll(".circleG")
      .filter((d) => descendants.some((sd) => sd.id === d.id))
      .classed("dragging-subtree", true);

    this.main
      .selectAll(".circleG")
      .filter(function (d) {
        return (
          d3.select(this).select(".showCircle").classed("selectedNode") &&
          d.id !== node.id
        );
      })
      .style("display", "none");
  }

  onChangeOrder(node, newIndex) {
    this.svg.selectAll(".ghostCircle").attr("fill-opacity", 0);

    const sourceID = node.id;
    const parentID = node.parent.id;

    this.dispatcher(
      changeOrder({
        sourceID,
        parentID,
        newIndex,
      }),
    );
  }

  setNavioNodes() {
    const attributes = [];
    const queue = [];
    this.root?.children?.forEach((child) => queue.push(child));

    for (let idx = 0; idx < queue.length; idx += 1) {
      const node = queue[idx];
      if (!node || node?.data?.isActive === false) continue;

      const isCollapsed = node._children != null;
      const hasVisibleChildren =
        Array.isArray(node.children) && node.children.length > 0;

      if (node.data.id !== 0 && (isCollapsed || !hasVisibleChildren)) {
        attributes.push(node.data.name);
        continue;
      }

      if (hasVisibleChildren) {
        queue.push(...node.children.filter((child) => child?.data?.isActive !== false));
      }
    }

    const attrs = store.getState().metadata.attributes;
    const attrsByName = new Map(attrs.map((attr) => [attr.name, attr]));
    const columns = attributes.filter((attr) => {
      const completeAttr = attrsByName.get(attr);
      if (!completeAttr || completeAttr.isActive === false) return false;
      if (completeAttr.type !== "aggregation") return true;
      return Boolean(completeAttr.info?.exec && completeAttr.info?.formula !== "");
    });

    const currentColumns = store.getState().dataframe.present.navioColumns || [];
    const hasSameColumns =
      columns.length === currentColumns.length &&
      columns.every((columnName, index) => columnName === currentColumns[index]);

    if (hasSameColumns) return;

    this.dispatcher(setNavioColumns(columns));
  }

  onChangeHierarchy() {
    this.svg.selectAll(".ghostCircle").attr("fill-opacity", 0);
    const targetID = this.targetNode.data.id;
    const sourceIDs = this.nodesDragged.map((n) => n.id);
    this.dispatcher(
      changeRelationship({
        sourceID: sourceIDs[0],
        targetID: targetID,
        recover: true,
      }),
    );
  }

  async addSelectedNodes({ parent }) {
    const selectedNodes = this.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const roots = selectedNodes.filter(
      (d) => !selectedNodes.includes(d.parent),
    );
    const orphans = selectedNodes.filter(
      (d) => d.parent && !selectedNodes.includes(d.parent),
    );

    const mods = [...roots];
    orphans.forEach((o) => {
      if (!mods.includes(o)) mods.push(o);
    });

    const toApply = [];
    const failed = [];

    mods.forEach((d) => {
      const nodeName = getNodeLabel(d);
      if (d.id === parent || d.descendants().some((nd) => nd.id === parent)) {
        failed.push(
          `${nodeName}: cannot move into itself or one of its descendants.`,
        );
        return;
      }
      toApply.push(d);
    });

    for (const d of toApply) {
      const nodeName = getNodeLabel(d);
      try {
        await this.dispatcher(
          changeRelationship({
            sourceID: d.id,
            targetID: parent,
            recover: false,
            silent: true,
          }),
        ).unwrap();
      } catch (error) {
        failed.push(`${nodeName}: ${extractErrorMessage(error, "Unknown error")}`);
      }
    }

    if (failed.length > 0) {
      notify({
        message:
          failed.length === mods.length
            ? "Cannot add selected nodes"
            : "Selection moved with warnings",
        description: `Failed (${failed.length}): ${formatListPreview(failed, 4)}`,
        type: failed.length === mods.length ? "error" : "warning",
        pauseOnHover: true,
        duration: 6,
      });
    }

    if (toApply.length > 0 || failed.length > 0) {
      this.svg.selectAll(".showCircle").classed("selectedNode", false);
    }
  }

  async removeSelectedNodes() {
    const selectedNodes = this.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    if (selectedNodes.length === 0) {
      notifyInfo({
        message: "No nodes selected",
        description: "Select one or more nodes to delete them.",
      });
      return;
    }

    const deletableNodes = selectedNodes.filter(
      (node) => node.id !== 0 && node.id !== this.root?.id,
    );

    if (deletableNodes.length === 0) {
      notifyWarning({
        message: "Cannot delete selection",
        description: "The root node cannot be deleted.",
      });
      return;
    }

    const nodeNames = deletableNodes.map((node) => getNodeLabel(node));
    const shouldDelete = window.confirm(
      `You are going to delete ${deletableNodes.length} selected node${
        deletableNodes.length === 1 ? "" : "s"
      }.\n\n${formatListPreview(nodeNames, 4)}\n\nThis action cannot be undone.`,
    );

    if (!shouldDelete) return;

    const failed = [];
    let deletedCount = 0;

    const sortedNodes = deletableNodes
      .slice()
      .sort(
        (a, b) =>
          (b.ancestors?.()?.length ?? 0) - (a.ancestors?.()?.length ?? 0),
      );

    const getDeletePrecheckError = (nodeId) => {
      const attributes = store.getState().metadata.attributes;
      if (!Array.isArray(attributes)) {
        return "Metadata attributes are not available.";
      }

      const currentNode = attributes.find((n) => n.id === nodeId);
      if (!currentNode) return "Node no longer exists.";

      const parentNode = attributes.find((n) => n.related.includes(nodeId));
      if (!parentNode) return "Current parent not found in hierarchy.";

      const isUsed = parentNode.info?.usedAttributes?.find(
        (used) => used.id === nodeId,
      );
      if (isUsed) return "Node is part of an existing aggregation.";

      return null;
    };

    for (const node of sortedNodes) {
      const precheckError = getDeletePrecheckError(node.id);
      if (precheckError) {
        failed.push(`${getNodeLabel(node)}: ${precheckError}`);
        continue;
      }

      try {
        await this.dispatcher(
          removeAttribute({ attributeID: node.id }),
        ).unwrap();
        deletedCount += 1;
      } catch (error) {
        failed.push(
          `${getNodeLabel(node)}: ${extractErrorMessage(error, "Unknown error")}`,
        );
      }
    }

    this.svg.selectAll(".showCircle").classed("selectedNode", false);

    if (failed.length === 0) {
      notify({
        message: "Selection deleted",
        description: `Deleted (${deletedCount}): ${formatListPreview(nodeNames, 6)}`,
        type: "success",
      });
      return;
    }

    notify({
      message:
        deletedCount === 0
          ? "Cannot delete selected nodes"
          : "Selection deleted with warnings",
      description:
        deletedCount === 0
          ? `Failed (${failed.length}): ${formatListPreview(failed, 4)}`
          : `Deleted ${deletedCount}/${deletableNodes.length}. Failed (${failed.length}): ${formatListPreview(failed, 4)}`,
      type: deletedCount === 0 ? "error" : "warning",
      pauseOnHover: true,
      duration: 6,
    });
  }

  getBrush() {
    let vis = this;
    const brush = d3
      .brush()
      .on("start", brushStart)
      .on("brush", brushMove)
      .on("end", brushEnd);

    function brushStart(e) {
      e.sourceEvent.stopPropagation();
    }

    function brushMove() {}

    function brushEnd({ selection }) {
      if (!selection) {
        removeBrush();
        return;
      }

      const [[x0, y0], [x1, y1]] = selection;
      const svgNode = vis.svg.node();
      const pt = svgNode.createSVGPoint();

      // Obtener solo nodos dentro del brush
      const nodesInside = [];
      vis.svg.selectAll(".circleG").each(function (d) {
        pt.x = 0;
        pt.y = 0;
        const { x: gx, y: gy } = pt.matrixTransform(this.getCTM());
        if (gx >= x0 && gx <= x1 && gy >= y0 && gy <= y1) {
          nodesInside.push(d);
        }
      });

      if (nodesInside.length === 0) {
        removeBrush();
        return;
      }

      // Acumular selección: mantener los nodos ya seleccionados y agregar los del brush actual
      nodesInside.forEach((node) => {
        vis.svg
          .selectAll(".circleG")
          .filter((d) => d.id === node.id)
          .select(".showCircle")
          .classed("selectedNode", true);
      });

      removeBrush();
    }

    /* function brushEnd({ selection }) {
      if (!selection) {
        removeBrush();
        return;
      }

      const [[x0, y0], [x1, y1]] = selection;
      const svgNode = vis.svg.node();
      const pt = svgNode.createSVGPoint();

      const nodesInside = [];
      vis.svg.selectAll(".circleG").each(function (d) {
        pt.x = 0;
        pt.y = 0;
        const { x: gx, y: gy } = pt.matrixTransform(this.getCTM());
        if (gx >= x0 && gx <= x1 && gy >= y0 && gy <= y1) {
          nodesInside.push(d);
        }
      });

      const rootsToToggle = nodesInside.filter(
        (d) => !nodesInside.includes(d.parent)
      );

      const selectedIds = new Set();
      vis.svg.selectAll(".circleG .showCircle.selectedNode").each(function (d) {
        selectedIds.add(d.id);
      });

      rootsToToggle.forEach((root) => {
        const isCurrentlySelected = selectedIds.has(root.id);
        const newState = !isCurrentlySelected;

        const hasSelectedAncestor = root
          .ancestors()
          .slice(1)
          .some((a) => selectedIds.has(a.id));
        if (newState === false && hasSelectedAncestor) {
          return;
        }

        root.descendants().forEach((nodeDatum) => {
          vis.svg
            .selectAll(".circleG")
            .filter((d2) => d2.id === nodeDatum.id)
            .select(".showCircle")
            .classed("selectedNode", newState);
        });
      });
      removeBrush();
    } */

    function removeBrush() {
      vis.svg.selectAll(".brush").remove();
      vis.svg.on(".brush", null);
      vis.svg.call(vis.zoomBehaviour);
    }

    return brush;
  }

  onResize(newDim) {
    if (newDim === null) {
      return;
    }
    const { width, height } = newDim;
    this.svg.attr("width", width).attr("height", height);

    this.dims.width = width;
    this.dims.height = height;
  }

  aggregateSelectedNodes({ parent, source }) {
    const aggregationNode = {
      id: getRandomInt(0, 9999999),
      name: `Unknown Aggregation`,
      type: "aggregation",
    };

    const selectedNodes = this.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const roots = selectedNodes.filter(
      (d) => !selectedNodes.includes(d.parent),
    );
    const orphans = selectedNodes.filter(
      (d) => d.parent && !selectedNodes.includes(d.parent),
    );

    const mods = [...roots];
    orphans.forEach((o) => {
      if (!mods.includes(o)) mods.push(o);
    });

    const attributes = store.getState().metadata.attributes || [];
    const childIDs = [];
    const failed = [];

    mods.forEach((d) => {
      const nodeName = getNodeLabel(d);
      if (d.id === parent || d.descendants().some((nd) => nd.id === parent)) {
        failed.push(
          `${nodeName}: cannot aggregate into itself or one of its descendants.`,
        );
        return;
      }

      const hasParent = attributes.some((n) => n.related.includes(d.id));
      if (!hasParent) {
        failed.push(`${nodeName}: current parent not found in hierarchy.`);
        return;
      }

      childIDs.push(d.id);
    });

    if (childIDs.length === 0) {
      if (failed.length > 0) {
        notifyError({
          message: "Cannot aggregate selection",
          description: `Failed (${failed.length}): ${formatListPreview(failed, 4)}`,
          pauseOnHover: true,
          duration: 6,
        });
      }
      return;
    }

    this.dispatcher(
      aggregateSelectedNodes({
        ...aggregationNode,
        childIDs,
        parentID: parent,
        sourceID: source,
      }),
    );
    this.svg.selectAll(".showCircle").classed("selectedNode", false);

    if (failed.length > 0) {
      notifyWarning({
        message: "Aggregation completed with warnings",
        description: `Failed (${failed.length}): ${formatListPreview(failed, 4)}`,
        pauseOnHover: true,
        duration: 6,
      });
    }
  }

  inspectNode({ nodeId }) {
    const node = this.root.descendants().find((d) => d.id === nodeId);
    if (node) publish("nodeInspectionNode", { nodeId });
  }

  focusNode({ nodeId }) {
    const node = this.root.descendants().find((d) => d.id === nodeId);
    if (!node) return;

    const { width, height } = this.dims;
    const scale = 0.8;

    const { x: screenX, y: screenY } = this.projectPoint(node.x, node.y);
    const tx = width / 2 - screenX * scale;
    const ty = height / 2 - screenY * scale;

    this.svg
      .transition()
      .duration(transitionDuration)
      .call(
        this.zoomBehaviour.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale),
      )
      .on("end", () => {
        const nodeG = this.svg
          .selectAll(".circleG")
          .filter((d) => d.id === nodeId);
        if (nodeG.empty()) return;

        const nodeColor =
          nodeG.select("circle").attr("fill") ||
          nodeG.select("circle").attr("stroke") ||
          "#1677ff";

        const highlight = nodeG
          .append("circle")
          .attr("class", "focus-ring")
          .attr("r", 0)
          .attr("stroke", nodeColor)
          .attr("stroke-width", 10)
          .attr("fill", "none")
          .attr("pointer-events", "none")
          .attr("opacity", 0.9);

        highlight
          .transition()
          .duration(1200)
          .attr("r", 100)
          .attr("opacity", 0)
          .ease(d3.easeCubicOut)
          .remove();
      });
  }

  addSubscriptions() {
    this.subscriptionHandlers = {
      addSelectedNodes: this.addSelectedNodes.bind(this),
      aggregateSelectedNodes: this.aggregateSelectedNodes.bind(this),
      removeSelectedNodes: this.removeSelectedNodes.bind(this),
      focusNode: this.focusNode.bind(this),
      inspectNode: this.inspectNode.bind(this),
    };

    Object.entries(this.subscriptionHandlers).forEach(([eventName, handler]) => {
      subscribe(eventName, handler);
    });
  }

  destroy() {
    if (this.navioSyncTimeout) {
      clearTimeout(this.navioSyncTimeout);
      this.navioSyncTimeout = null;
    }

    Object.entries(this.subscriptionHandlers).forEach(([eventName, handler]) => {
      unsubscribe(eventName, handler);
    });
    this.subscriptionHandlers = {};
  }
}
