import * as d3 from "d3";

import { setNavioColumns } from "@/store/slices/dataSlice";
import { aggregateSelectedNodes, changeOrder } from "@/store/slices/metaSlice";
import {
  changeRelationship,
  toggleAttribute,
} from "@/store/async/metaAsyncReducers";
import store from "@/store/store";

import { pubsub } from "@/utils/pubsub";
import { DataType } from "@/utils/Constants";
import { fixTooltipToNode, getRandomInt, moveTooltip } from "@/utils/functions";

let { publish, subscribe } = pubsub;

const dtypeColors = {
  [DataType.NUMERICAL.dtype]: DataType.NUMERICAL.color,
  [DataType.TEXT.dtype]: DataType.TEXT.color,
  [DataType.UNKNOWN.dtype]: DataType.UNKNOWN.color,
  root: "white",
};

function colorNode(node) {
  const dtype = node.data?.dtype || "none";
  return dtypeColors[dtype];
}

function curveSShape(d) {
  const sx = d.source.x;
  const sy = d.source.y;
  const tx = d.target.x;
  const ty = d.target.y;

  const controlPointY1 = sy + (ty - sy) * curvature;
  const controlPointX1 = sx;

  const controlPointY2 = ty - (ty - sy) * curvature;
  const controlPointX2 = tx;

  return `
      M${sy},${sx}
      C${controlPointY1},${controlPointX1} ${controlPointY2},${controlPointX2} ${ty},${tx}
    `;
}

const transitionDuration = 800;
const assignRadius = 40;
const curvature = 1;
const maxString = 20;
const horizontalDistance = maxString * 15;
const compressionFactor = 1.5;
const nodeSize = 60;
const spacing = horizontalDistance * compressionFactor;

export default class D3HierarchyEditor {
  targetNode = null;
  nodesDragged = [];

  constructor(container, data, dispatcher) {
    this.containerRef = container;
    this.dispatcher = dispatcher;

    this.descriptions = store.getState().cantab.present.descriptions;
    this.dims = container.getBoundingClientRect();

    this.width = this.dims.width;
    this.height = this.dims.height;
    this.data = data;

    this.svg = d3.select(this.containerRef);

    this.svg.on("contextmenu", (event, node) => {
      publish("untoggleEvent", {});
      publish("closeResultsEvent", {});
      publish("closeOptionMenu", {});

      event.preventDefault();
    });

    this.svg
      .on("click", (event, node) => {
        event.preventDefault();
        event.stopPropagation();
        publish("untoggleEvent", {});
        publish("closeResultsEvent", {});
        publish("closeOptionMenu", {});
      })
      .on("contextmenu", (event, node) => {
        event.preventDefault();
        event.stopPropagation();

        this.svg.selectAll(".showCircle").classed("selectedNode", false);
      });

    this.brush = this.getBrush();

    d3.select(window).on("keydown", (event) => {
      if (event.key === "b" || event.key === "B") {
        this.svg.append("g").attr("class", "brush").call(this.brush);
      }
    });

    this.main = this.svg.select("g#main-container").node()
      ? this.svg.select("g#main-container")
      : this.svg.append("g").attr("id", "main-container");

    const baseTransform = d3.zoomIdentity
      .translate(this.width / 8, this.height / 2)
      .scale(0.8);

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

    const gnode = this.main.select("g#nodes").node()
      ? this.main.select("g#nodes")
      : this.main.append("g").attr("id", "nodes");

    glink
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("stroke-opacity", 1)
      .attr("stroke-width");
    this.addSubscriptions();

    this.tooltip = d3.select("body").select("div.tooltip");
    if (this.tooltip.empty()) {
      this.tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    this.update(data);
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
      this.nNodes += 1;
    });
  }

  update(newData) {
    console.log("updateData", newData);
    this.setSize();
    this.data = newData;
    this.root = d3.hierarchy(newData);
    this.initHierarchy();
    this.drawHierarchy(this.root, true);
    this.setNavioNodes();
  }

  drawHierarchy(source, instant = false) {
    console.log("drawHierarchy");
    const { root } = this;
    const treeLayout = d3.tree().nodeSize([nodeSize, nodeSize]);
    treeLayout(root);

    root.descendants().forEach((node) => {
      node.y = node.depth * spacing;
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
            .attr(
              "transform",
              (d) =>
                `translate(${source.y0 ?? source.y}, ${source.x0 ?? source.x})`
            )
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

            if (type === "aggregation" && nChildren === 0) {
              group
                .append("path")
                .attr("class", "showCircle")
                .attr("d", "M 0 -14.4 L 12.5 7.2 L -12.5 7.2 Z")
                .attr("fill", fill);
            } else if (type === "aggregation" || type === "root") {
              group
                .append("rect")
                .attr("class", "showCircle")
                .attr("x", -12.5)
                .attr("y", -12.5)
                .attr("width", 25)
                .attr("height", 25)
                .attr("rx", 4)
                .attr("fill", fill);
            } else {
              group
                .append("circle")
                .attr("class", "showCircle")
                .attr("r", 12.5)
                .attr("fill", fill);
            }

            if (d._children && !d.children) {
              group
                .select(".showCircle")
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            }
          });

          g.append("circle")
            .attr("class", "ghostCircle")
            .attr("r", assignRadius)
            .attr("opacity", 0.2)
            .attr("fill", "red")
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
            .attr("x", (node) =>
              node.id === graph.root.id
                ? -30
                : node.children?.length >= 2
                ? 0
                : 25
            )
            .attr("y", (d) => (d.id !== graph.root.id && d.children ? -25 : 0))
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .text((node) =>
              node.data.name.length < maxString
                ? node.data.name
                : node.data.name.slice(0, maxString - 1) + "..."
            )
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 2)
            .attr("paint-order", "stroke");

          return g;
        },
        (update) => update,
        (exit) =>
          exit
            .transition()
            .duration(transitionTime)
            .attr("transform", (d) => `translate(${source.y}, ${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .remove()
      );

    gnode
      .select(".showCircle")
      .attr("stroke", (d) => {
        return (d._children && !d.children) || d.data.name === "Root"
          ? "black"
          : "none";
      })
      .attr("stroke-width", 2);

    gnode
      .transition()
      .duration(transitionTime)
      .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);

    gnode
      .select("text")
      .attr("x", 0)
      .attr("y", -28)
      .attr("text-anchor", "middle");
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
      .attr("stroke", "grey")
      .attr("stroke-opacity", 1)
      .attr("stroke-width", 1)
      .attr("d", (d) => {
        const o = { x: source.x0, y: source.y0 };
        return curveSShape({ source: o, target: o });
      });

    glink
      .merge(enterLinks)
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr("d", curveSShape);

    glink
      .exit()
      .transition()
      .duration(instant ? 0 : transitionDuration)
      .attr("d", (d) => {
        const o = { x: source.x, y: source.y };
        return curveSShape({ source: o, target: o });
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
            graph.tooltip
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
            graph._dragSiblingMinY = Math.min(...ys) - spacing;
            graph._dragSiblingMaxY = Math.max(...ys) + spacing;

            graph._dragOriginalIndex = graph._dragSiblingXPositions.indexOf(
              node.x
            );
            graph._originalX = node.x;
            graph._currentHoverIndex = graph._dragOriginalIndex;
          }
        }

        graph.svg.style("cursor", "grabbing");

        const movingNodes = [node].flatMap((n) =>
          n.descendants ? n.descendants() : [n]
        );

        movingNodes.forEach((d) => {
          d.x += event.dy;
          d.y += event.dx;
        });

        graph.main
          .select("#nodes")
          .selectAll(".circleG")
          .filter((d) => movingNodes.some((mn) => mn.id === d.id))
          .attr("transform", (d) => `translate(${d.y},${d.x})`)
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
          .attr("d", (l) => curveSShape(l));

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
              (sib) => sib.id !== node.id
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
                  childNode.x - graph._dragSiblingXPositions[referenceIndex]
                );

                subtree.forEach((d) => {
                  d.x += moveLeft ? space : -space;

                  graph.main
                    .selectAll(".circleG")
                    .filter((nodeD) => nodeD.id === d.id)
                    .attr("transform", `translate(${d.y},${d.x})`);
                });

                graph.main
                  .select("#links")
                  .selectAll("path")
                  .filter(
                    (l) =>
                      subtree.some((n) => n.id === l.source.id) ||
                      subtree.some((n) => n.id === l.target.id)
                  )
                  .attr("d", (l) => curveSShape(l));
              } else {
                // Nodo que no debe moverse: restaurar posición original
                subtree.forEach((d) => {
                  d.x = d._originalX;
                  d.y = d._originalY;

                  graph.main
                    .selectAll(".circleG")
                    .filter((nodeD) => nodeD.id === d.id)
                    .attr("transform", `translate(${d.y},${d.x})`);
                });

                // Recalcular enlaces para el subtree no movido
                graph.main
                  .select("#links")
                  .selectAll("path")
                  .filter(
                    (l) =>
                      subtree.some((n) => n.id === l.source.id) ||
                      subtree.some((n) => n.id === l.target.id)
                  )
                  .attr("d", (l) => curveSShape(l));
              }
            });

            // Actualizar nuevo índice y destacar los hermanos
            graph.newIndex = newIndex;

            graph.main
              .selectAll(".circleG")
              .classed("highlight-sibling", false)
              .filter(
                (d) => d.id === leftSibling?.id || d.id === rightSibling?.id
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
          .filter(function (d) {
            return d3
              .select(this)
              .select(".showCircle")
              .classed("selectedNode");
          })
          .data()
      : [node];

    const descendants = nodesToMove.flatMap((n) =>
      n.descendants ? n.descendants() : [n]
    );

    if (isMultiSelect) {
      this.main
        .select("#nodes")
        .selectAll(".circleG")
        .filter(
          (d) =>
            descendants.some((sd) => sd.id === d.id) && d.id !== node.data.id
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
      toggleAttribute({ attributeID: node.data.id, fromFocus: false })
    );
    this.drawHierarchy(node);
    this.setNavioNodes();
  }

  initNodeDrag(node) {
    // se cogen los nodos que esten seleccionados
    this.nodesDragged = this.svg
      .selectAll(".circleG")
      .filter(function (d) {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const nodesToMove = this.svg
      .selectAll(".circleG")
      .filter(function (d) {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const descendants = nodesToMove.flatMap((n) =>
      n.descendants ? n.descendants() : [n]
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
      })
    );
  }

  setNavioNodes() {
    console.log("setNavioNodes");
    let attributes = [];
    const addAttribute = (n) => {
      if (n.data.id !== 0 && n.children == null) attributes.push(n.data.name);

      if (n._children != null) return;
      if (n.children != null) n.children.forEach(addAttribute);
    };

    this.root.children?.forEach(addAttribute);
    const attrs = store.getState().metadata.attributes;
    const columns = attributes.filter((attr) => {
      const complete_attr = attrs.find((a) => a.name === attr);
      if (complete_attr.type != "aggregation") return true;
      else if (complete_attr.info?.exec && complete_attr.info?.formula !== "")
        return true;
      else return false;
    });

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
      })
    );
  }

  addSelectedNodes({ parent }) {
    const selectedNodes = this.svg
      .selectAll(".circleG")
      .filter(function (d) {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const roots = selectedNodes.filter(
      (d) => !selectedNodes.includes(d.parent)
    );
    const orphans = selectedNodes.filter(
      (d) => d.parent && !selectedNodes.includes(d.parent)
    );

    const mods = [...roots];
    orphans.forEach((o) => {
      if (!mods.includes(o)) mods.push(o);
    });

    const toApply = mods.filter(
      (d) => d.id !== parent && !d.descendants().some((nd) => nd.id === parent)
    );

    if (toApply.length === 0) return;

    toApply.forEach((d) => {
      this.dispatcher(
        changeRelationship({
          sourceID: d.id,
          targetID: parent,
          recover: false,
        })
      );
    });

    this.svg.selectAll(".showCircle").classed("selectedNode", false);
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
        b;
        removeBrush();
        return;
      }

      // Primero, quitar la selección de todos los nodos
      vis.svg.selectAll(".circleG .showCircle").classed("selectedNode", false);

      // Seleccionar solo los nodos dentro del brush
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
      .filter(function (d) {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    const roots = selectedNodes.filter(
      (d) => !selectedNodes.includes(d.parent)
    );
    const orphans = selectedNodes.filter(
      (d) => d.parent && !selectedNodes.includes(d.parent)
    );

    const mods = [...roots];
    orphans.forEach((o) => {
      if (!mods.includes(o)) mods.push(o);
    });

    const childIDs = mods
      .filter(
        (d) =>
          d.id !== parent && !d.descendants().some((nd) => nd.id === parent)
      )
      .map((d) => d.id);

    if (childIDs.length === 0) return;

    this.dispatcher(
      aggregateSelectedNodes({
        ...aggregationNode,
        childIDs,
        parentID: parent,
        sourceID: source,
      })
    );
    this.svg.selectAll(".showCircle").classed("selectedNode", false);
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

    const tx = width / 2 - node.y * scale;
    const ty = height / 2 - node.x * scale;

    this.svg
      .transition()
      .duration(transitionDuration)
      .call(
        this.zoomBehaviour.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
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
    subscribe("addSelectedNodes", this.addSelectedNodes.bind(this));
    subscribe("aggregateSelectedNodes", this.aggregateSelectedNodes.bind(this));
    subscribe("focusNode", this.focusNode.bind(this));
    subscribe("inspectNode", this.inspectNode.bind(this));
  }
}
