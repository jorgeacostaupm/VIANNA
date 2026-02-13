import * as d3 from "d3";

export default function renderLegend(
  legend,
  groups,
  color,
  blur,
  setBlur,
  hide,
  setHide,
  showStats,
  hideStats
) {
  const circleSize = 10;
  const padding = 6;
  const lineHeight = circleSize * 2 + padding;

  const legendGroup = legend
    .append("g")
    .attr("class", "legend-group")
    .style("cursor", "pointer");

  const orderedGroups = Array.isArray(groups) ? [...groups] : [];

  orderedGroups.forEach((group, i) => {
    const y = i * lineHeight + circleSize * 2;

    const legendItem = legendGroup
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", `translate(0,${y})`);

    const circles = legendItem
      .append("circle")
      .attr("class", "legend-circle")
      .attr("cx", circleSize + 10)
      .attr("cy", 0)
      .attr("r", circleSize)
      .style("fill", color(group));

    if (blur)
      circles.classed("blur", blur.includes(group)).on("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = d3.select(e.currentTarget);
        const isBlur = item.classed("blur");
        setBlur((prev) =>
          prev.includes(group)
            ? prev.filter((g) => g !== group)
            : [...prev, group]
        );
        item.classed("blur", !isBlur);
      });

    const labels = legendItem
      .append("text")
      .attr("class", "legend-label")

      .attr("x", circleSize * 2 + 15)
      .attr("y", 4)
      .datum(group)
      .text(group);

    if (hide) {
      labels.classed("cross", hide.includes(group)).on("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sel = d3.select(e.currentTarget);
        const isHide = sel.classed("cross");

        setHide((prev) =>
          prev.includes(group)
            ? prev.filter((g) => g !== group)
            : [...prev, group]
        );

        if (!isHide && hideStats) hideStats(group);

        sel.classed("cross", !isHide);
      });

      legendItem
        .on("mouseover", () => {
          const hideGroups = orderedGroups.filter((d) => d !== group);
          setHide(hideGroups);
          if (showStats) showStats(group);
        })
        .on("mouseout", () => {
          const hideGroups = legend.selectAll(".cross").data();

          setHide(hideGroups);
          if (hideStats) hideStats(group);
        });
    }
  });

  const bbox = legendGroup.node().getBBox();

  const parent = legend.node().parentNode;
  const { width, height } = parent.getBoundingClientRect();

  if (height > bbox.y + bbox.height) {
    d3.select(parent).style("align-items", "center");
  } else {
    d3.select(parent).style("align-items", null);
  }

  if (width > bbox.x + bbox.width) {
    d3.select(parent).style("justify-content", "center");
  } else {
    d3.select(parent).style("justify-content", null);
  }

  legend
    .attr("width", bbox.x + bbox.width)
    .attr("height", bbox.y + bbox.height);
}
