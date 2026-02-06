import React from "react";
import { Dropdown } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import BarButton from "./BarButton";

const downloadFormats = [
  { key: "png", label: "PNG (.png)" },
  { key: "svg", label: "SVG (.svg)" },
  { key: "jpg", label: "JPG (.jpg)" },
];

export default function DownloadButton({ filename = "chart", svgIds = [] }) {
  const disabled = !svgIds?.length;
  const menu = {
    items: downloadFormats,
    onClick: ({ key }) => handleDownload(filename, svgIds, key),
  };

  return (
    <Dropdown
      menu={menu}
      placement="bottomRight"
      trigger={["click"]}
      disabled={disabled}
    >
      <span>
        <BarButton
          title="Download image"
          icon={<DownloadOutlined />}
          disabled={disabled}
        />
      </span>
    </Dropdown>
  );
}

function handleDownload(filename, svgIds, format) {
  try {
    const svgs = [];

    let totalWidth = 0;
    let maxHeight = 0;

    for (const id of svgIds) {
      const svg = document.getElementById(id);
      if (!svg) continue;

      const { width, height } = svg.getBoundingClientRect();

      svgs.push({ svg, width, height });
      totalWidth += width;
      maxHeight = Math.max(maxHeight, height);
    }

    if (!svgs.length || totalWidth === 0 || maxHeight === 0) {
      return;
    }

    const combinedSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    combinedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    combinedSvg.setAttribute("width", totalWidth);
    combinedSvg.setAttribute("height", maxHeight);

    let currentX = 0;

    for (const { svg, width, height } of svgs) {
      const clone = svg.cloneNode(true);
      const offsetY = (maxHeight - height) / 2;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${currentX}, ${offsetY})`);

      g.appendChild(clone);
      combinedSvg.appendChild(g);

      currentX += width;
    }

    const styleEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );

    const cssRules = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    styleEl.textContent = cssRules;
    combinedSvg.insertBefore(styleEl, combinedSvg.firstChild);

    const serialized = new XMLSerializer().serializeToString(combinedSvg);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -1);

    const normalizedFormat = (format || "svg").toLowerCase();
    const isSvg = normalizedFormat === "svg";
    const isJpg = normalizedFormat === "jpg" || normalizedFormat === "jpeg";
    const extension = isSvg ? "svg" : isJpg ? "jpg" : "png";
    const fullFilename = `${filename}_${timestamp}.${extension}`;

    if (isSvg) {
      const blob = new Blob([serialized], { type: "image/svg+xml" });
      triggerDownload(blob, fullFilename);
      return;
    }

    const svgBlob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(totalWidth * dpr);
      canvas.height = Math.ceil(maxHeight * dpr);
      canvas.style.width = `${totalWidth}px`;
      canvas.style.height = `${maxHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(svgUrl);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (isJpg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, totalWidth, maxHeight);
      }

      ctx.drawImage(image, 0, 0, totalWidth, maxHeight);

      const mimeType = isJpg ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (blob) {
            triggerDownload(blob, fullFilename);
          }
        },
        mimeType,
        0.95
      );

      URL.revokeObjectURL(svgUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
    };

    image.src = svgUrl;
  } catch (err) {
    console.error("Download error:", err);
  }
}

function triggerDownload(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
