import React, { useState } from "react";

import { DownloadOutlined } from "@ant-design/icons";
import AutoCloseTooltip from "./AutoCloseTooltip";
import styles from "./Buttons.module.css";
import BarButton from "./BarButton";

export default function DownloadButton({ svgIds = [], filename = "chart" }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { Canvg } = await import("canvg");

      // Crear SVG combinado
      const combinedSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      combinedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      let totalWidth = 0;
      let maxHeight = 0;

      for (const id of svgIds) {
        const svg = document.getElementById(id);
        if (!svg) throw new Error(`SVG element with ID "${id}" not found`);

        const clone = svg.cloneNode(true);
        const { width, height } = svg.getBoundingClientRect();

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${totalWidth}, 0)`);
        g.appendChild(clone);

        combinedSvg.appendChild(g);
        totalWidth += width;
        maxHeight = Math.max(maxHeight, height);
      }

      combinedSvg.setAttribute("width", totalWidth);
      combinedSvg.setAttribute("height", maxHeight);

      // Renderizar en canvas con Canvg
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 4;
      canvas.width = totalWidth * scale;
      canvas.height = maxHeight * scale;
      ctx.scale(scale, scale);

      const serialized = new XMLSerializer().serializeToString(combinedSvg);
      const v = await Canvg.fromString(ctx, serialized);
      await v.render();

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -1);
      const fullFilename = `${filename}_${timestamp}.png`;

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fullFilename;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BarButton
      title="Download view as png"
      icon={<DownloadOutlined />}
      onClick={handleDownload}
    />
  );
}
