import { useEffect, useRef } from "react";
import { Select } from "antd";
import { useField, useFormikContext } from "formik";
import { Typography } from "antd";
const { Text } = Typography;

const dtypeMap = {
  number: "Number",
  string: "Text",
  date: "Date",
  determine: "To determine",
};

const dtypeColor = {
  number: "#377eb8",
  date: "#4daf4a",
  string: "#f781bf",
  determine: "#ff7f00",
};

const dtypeTextColor = {
  number: "white",
  date: "white",
  string: "white",
  determine: "white",
};

const NodeInfo = ({ nChildren, nodeType }) => {
  const [field, meta, helpers] = useField("dtype");
  const { errors } = useFormikContext();
  const { setValue } = helpers;
  const selectRef = useRef();

  useEffect(() => {
    const selector = selectRef.current?.querySelector(".ant-select-selector");
    if (selector) {
      selector.style.backgroundColor = dtypeColor[field.value];
      selector.style.color = dtypeTextColor[field.value];
      selector.style.border = "none";
      selector.style.fontWeight = "600";
      selector.style.textAlign = "center";
    }
  }, [field.value]);

  const dtypeOptions = Object.keys(dtypeMap).map((key) => ({
    value: key,
    label: dtypeMap[key],
  }));

  let nodeName = "";
  switch (nodeType) {
    case "attribute":
      nodeName = "Original";
      break;
    case "root":
      nodeName = "Root";
      break;
    case "aggregation":
      nodeName = nChildren === 0 ? "Measure" : "Aggregation";
      break;
    default:
      nodeName = "Unknown";
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Text strong>Nº Children:</Text>
        <Text strong>{nChildren}</Text>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Text strong>Node type:</Text>
        <Text strong>{nodeName}</Text>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Text strong>Data type:</Text>
        <div ref={selectRef}>
          <Select
            value={field.value}
            onChange={(value) => setValue(value)}
            options={dtypeOptions}
            style={{
              width: 140,
              borderRadius: 6,
            }}
            dropdownStyle={{ textAlign: "center" }}
            dropdownMatchSelectWidth={false}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          color: "red",
        }}
      >
        {errors?.dtype}
      </div>
    </>
  );
};

export default NodeInfo;
