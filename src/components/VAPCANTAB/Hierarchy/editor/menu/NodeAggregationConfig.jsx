import { useState } from "react";
import { Select } from "antd";
import { Field } from "formik";

import AggregateComponent from "./aggregations/AggregateComponent";
import CustomAggregate from "./custom/CustomAggregate";

const { Option } = Select;

const NodeAggregationConfig = ({ aggOp, children, vals }) => {
  const [isCollapse, collapseSection] = useState(false);

  const containerStyle = {
    display: isCollapse ? "none" : "block",
    marginTop: "0.5rem",
    transition: "transform 300ms",

    paddingBottom: "1rem",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  };

  const selectStyle = {
    width: "60%",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h4>Operation type:</h4>
        <Field name="info.operation">
          {({ field, form }) => (
            <Select
              id="info.operation"
              style={selectStyle}
              defaultValue={vals?.info?.operation || "sum"}
              onChange={(value) => form.setFieldValue(field.name, value)}
            >
              <Option value="sum">Summatory</Option>
              <Option value="mean">Mean</Option>
              <Option value="concat">Concatenate</Option>
              <Option value="custom">Custom</Option>
            </Select>
          )}
        </Field>
      </div>

      {vals.info == null || vals.info.operation !== "custom" ? (
        <AggregateComponent nodes={children} aggOp={aggOp} />
      ) : null}

      {vals.info != null && vals.info.operation === "custom" ? (
        <CustomAggregate nodes={children} formula={vals.info.formula} />
      ) : null}
    </div>
  );
};

export default NodeAggregationConfig;
