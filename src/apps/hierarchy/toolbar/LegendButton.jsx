import { Space, Typography } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";

import { NodeColors } from "@/utils/Constants";
import appStyles from "@/styles/App.module.css";
import PopoverButton from "@/components/ui/PopoverButton";

const { Text } = Typography;

const renderShapeSVG = (shape, color) => {
  switch (shape) {
    case "triangle":
      return (
        <svg width="25" height="25" viewBox="-15 -15 30 30">
          <path
            d="M 0 -14.4 L 12.5 7.2 L -12.5 7.2 Z"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      );
    case "square":
      return (
        <svg width="25" height="25" viewBox="-15 -15 30 30">
          <rect
            x="-12.5"
            y="-12.5"
            width="25"
            height="25"
            rx="4"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      );
    case "circle":
      return (
        <svg width="25" height="25" viewBox="-15 -15 30 30">
          <circle r="12.5" fill={color} stroke="#000" strokeWidth="1" />
        </svg>
      );
    case "rect":
      return (
        <svg width="40" height="20">
          <rect
            x="0"
            y="0"
            width="40"
            height="15"
            rx="3"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      );
    default:
      return null;
  }
};

function Legend() {
  const shapeLegend = [
    { name: "Original variable", shape: "circle", color: "white" },
    { name: "Aggregation with childs", shape: "square", color: "white" },
    { name: "Aggregation without childs", shape: "triangle", color: "white" },
  ];

  const colorLegend = [
    { name: "Number", shape: "circle", color: NodeColors.NUMERICAL },
    { name: "Text", shape: "circle", color: NodeColors.TEXT },
    {
      name: "Unknown",
      shape: "circle",
      color: NodeColors.UNKNOWN,
    },
  ];

  return (
    <>
      <Space
        direction="vertical"
        size="large"
        className={appStyles.popoverMenu}
      >
        <div>
          <Text strong style={{ fontSize: "24px" }}>
            Node types
          </Text>

          {shapeLegend.map(({ name, shape, color }) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "5px",
              }}
            >
              {renderShapeSVG(shape, color)}
              <Text strong style={{ fontSize: "18px" }}>
                {name}
              </Text>
            </div>
          ))}
        </div>

        <div>
          <Text strong style={{ fontSize: "24px" }}>
            Variable types
          </Text>

          {colorLegend.map(({ name, shape, color }) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "5px",
              }}
            >
              {renderShapeSVG(shape, color)}
              <Text strong style={{ fontSize: "18px" }}>
                {name}
              </Text>
            </div>
          ))}
        </div>
      </Space>
    </>
  );
}

export default function LegendButton() {
  return (
    <PopoverButton
      title={"Legend"}
      icon={<BgColorsOutlined />}
      content={<Legend></Legend>}
    ></PopoverButton>
  );
}
