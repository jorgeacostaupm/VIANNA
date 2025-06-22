import { useState } from "react";
import { Modal, Button, Tooltip, Typography } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { NodeColors } from "../../utils/Constants";
import buttonStyles from "@/utils/Buttons.module.css";

const { Text } = Typography;

export function Legend() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Leyenda personalizada con forma y color asignados a cada nombre
  const shapeLegend = [
    { name: "Original variable", shape: "circle", color: "white" },
    { name: "Aggregation without childs", shape: "triangle", color: "white" },
    { name: "Aggregation without childs", shape: "square", color: "white" },
  ];

  const colorLegend = [
    { name: "Number", shape: "circle", color: NodeColors.NUMERICAL },
    { name: "Text", shape: "circle", color: NodeColors.TEXT },
    { name: "Date", shape: "circle", color: NodeColors.DATE },
    {
      name: "Aggregation without formula",
      shape: "circle",
      color: NodeColors.UNKNOWN,
    },
  ];

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

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

  return (
    <>
      <Tooltip title={"Legend"}>
        <Button
          className={buttonStyles.coloredButton}
          shape="circle"
          onClick={showModal}
          icon={<BgColorsOutlined style={{ fontSize: "25px" }} />}
        />
      </Tooltip>
      <Modal
        title="Legend"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Text>Node types:</Text>
        <div style={{ marginBottom: 24 }}>
          {shapeLegend.map(({ name, shape, color }) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {renderShapeSVG(shape, color)}
              <span>{name}</span>
            </div>
          ))}
        </div>

        <Text>Variable types:</Text>
        <div style={{ marginBottom: 24 }}>
          {colorLegend.map(({ name, shape, color }) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {renderShapeSVG(shape, color)}
              <span>{name}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
