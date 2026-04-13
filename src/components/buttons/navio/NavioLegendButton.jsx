import React from "react";
import * as d3 from "d3";
import { Col, Row, Typography } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";

import PopoverButton from "@/components/buttons/ui/PopoverButton";

const TABLEAU_YELLOW = "#edc949";
const NAVIO_CATEGORIES = [
  ...d3.schemeTableau10.filter((color) => color !== TABLEAU_YELLOW),
  TABLEAU_YELLOW,
];

const colorScales = {
  "Numbers (from lowest to highest)": d3.scaleSequential(d3.interpolateBlues),
  Dates: d3.scaleSequential(d3.interpolatePurples),
  "Diverging numbers (from - to +)": d3.scaleSequential(d3.interpolateBrBG),
  Ordered: d3.scaleSequential(d3.interpolateOranges),
  Text: d3.scaleSequential(d3.interpolateGreys),
  Categories: NAVIO_CATEGORIES,
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
                    border: "1px solid var(--chart-border-strong)",
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

export default function NavioLegendButton() {
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
