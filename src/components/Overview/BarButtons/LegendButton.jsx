import React from "react";
import * as d3 from "d3";
import { Col, Row, Space, Typography } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";

import appStyles from "@/utils/App.module.css";
import PopoverButton from "@/utils/PopoverButton";

const colorScales = {
  "Numbers (from lowest to highest)": d3.scaleSequential(d3.interpolateBlues),
  Dates: d3.scaleSequential(d3.interpolatePurples),
  "Diverging numbers (from - to +)": d3.scaleSequential(d3.interpolateBrBG),
  Ordered: d3.scaleSequential(d3.interpolateOranges),
  Text: d3.scaleSequential(d3.interpolateGreys),
  Categories: d3.schemeCategory10,
};

const generateGradient = (scale, steps = 12) => {
  if (Array.isArray(scale)) return scale;
  return Array.from({ length: steps }, (_, i) => scale(i / (steps - 1)));
};

const { Text } = Typography;

function Legend() {
  return (
    <>
      {Object.entries(colorScales).map(([name, scale]) => (
        <div key={name}>
          <Text strong>{name}</Text>
          <Row gutter={[8, 8]}>
            {generateGradient(scale).map((color, index) => (
              <Col key={index} span={2}>
                <div
                  style={{
                    backgroundColor: color,
                    height: "20px",
                    width: "100%",
                    border: "1px solid black",
                  }}
                />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </>
  );
}

export default function LegendButton() {
  return (
    <>
      <PopoverButton
        title={"Legend"}
        icon={<BgColorsOutlined />}
        content={<Legend></Legend>}
      ></PopoverButton>
    </>
  );
}
