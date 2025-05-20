import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";

import { Modal, Row, Col } from "antd";
import * as d3 from "d3";

export const ColorScalesModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Escalas de colores de d3
  const colorScales = {
    "Numbers (from lowest to highest)": d3.scaleSequential(d3.interpolateBlues),
    Dates: d3.scaleSequential(d3.interpolatePurples),
    "Diverging Numbers (from negative to positive)": d3.scaleSequential(
      d3.interpolateBrBG
    ),
    Ordered: d3.scaleSequential(d3.interpolateOranges),
    Text: d3.scaleSequential(d3.interpolateGreys),
    Categories: d3.schemeCategory10,
  };

  const generateGradient = (scale, steps = 12) => {
    if (Array.isArray(scale)) {
      // Si es un array (como schemeCategory10), lo devolvemos directamente
      return scale;
    }
    // Si es una escala continua, generamos el gradiente
    return Array.from({ length: steps }, (_, i) => scale(i / (steps - 1)));
  };

  // Control del modal
  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  return (
    <>
      <Button
        type="primary"
        onClick={showModal}
        /*         style={{
          position: 'absolute',
          right: 170,
          top: 5,
          zIndex: 100,
          display: 'flex'
        }} */
      >
        <BgColorsOutlined />
        Color Scales
      </Button>
      <Modal
        title="Color Scales"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[]}
      >
        <div>
          {Object.entries(colorScales).map(([name, scale]) => (
            <div key={name} style={{ marginBottom: "20px" }}>
              <h4>{name}</h4>
              <Row gutter={[8, 8]}>
                {generateGradient(scale).map((color, index) => (
                  <Col key={index} span={2}>
                    <div
                      style={{
                        backgroundColor: color,
                        height: "20px",
                        width: "100%",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
