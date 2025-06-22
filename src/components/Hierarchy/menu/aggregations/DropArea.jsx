import { useState } from "react";
import { Button, Tooltip, Typography } from "antd";
import { useFormikContext } from "formik";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import DropIndicator, {
  clearHightlight,
  getIndicators,
  getNearestIndicator,
  highlightIndicators,
} from "./DropIndicator";
import BasicAttribute from "./BasicAttribute";
import InputAttribute from "./InputAttribute";
import buttonStyles from "@/utils/Buttons.module.css";
const { Text } = Typography;

const DropArea = ({
  allNodes,
  aggOp,
  nodes,
  moveNode,
  modeAllNodes,
  insertNodeField,
  pushNodeField,
  moveNodeField,
  save,
}) => {
  const [active, setActive] = useState(false);
  const [searchText, updateSearch] = useState("");

  const { errors } = useFormikContext();

  const handleDragStart = (e, attribute) => {
    e.dataTransfer.setData("attributeId", attribute.id);
  };

  const onDragOver = (event) => {
    setActive(true);
    highlightIndicators(event, "true");
    event.preventDefault();
  };

  const onDragLeave = () => {
    setActive(false);
    clearHightlight(null, true);
  };

  const onDragEnd = (event) => {
    const attrId = event.dataTransfer.getData("attributeId");
    const nodeId = parseInt(attrId);

    setActive(false);
    clearHightlight(null, true);

    // Calculate the final position of the moved element
    const indicators = getIndicators(true);
    const { element } = getNearestIndicator(event, indicators);

    const before = element.dataset.before || "-1";
    if (before === attrId) return;

    let transfered = allNodes.find((n) => n.id === nodeId);
    if (transfered == null) return;

    let usedNodes = nodes.filter((n) => n.used && n.id !== nodeId);

    transfered = { ...transfered, used: true };
    const position =
      before === "-1"
        ? -1
        : usedNodes.findIndex((el) => el.id === parseInt(before));
    if (nodes.filter((n) => n.id === nodeId).length > 0) {
      const current = nodes.findIndex((n) => n.id === nodeId);
      if (current !== -1) {
        moveNodeField(current, position);
      }
    } else {
      if (position === -1) {
        pushNodeField(transfered);
      } else {
        insertNodeField(position, transfered);
      }
    }

    moveNode(transfered, true, position);
  };

  const opStyle =
    aggOp !== "mean"
      ? { gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))" }
      : { gridTemplateColumns: "repeat(2, 1fr)" };

  return (
    <>
      <Text strong>Included Attributes:</Text>

      <div
        id="attributes"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDragEnd}
        style={{
          borderWidth: "3px",
          borderStyle: "dashed",
          borderRadius: "0.375rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          minHeight: "7vh",
          padding: "5px",
          gap: "5px",
        }}
      >
        {nodes.map((n, i) => {
          if (aggOp !== "mean") {
            return (
              <BasicAttribute
                key={n.id}
                idx={i}
                node={n}
                onDragStart={handleDragStart}
                isHidden={!n.name.toLowerCase().includes(searchText)}
              ></BasicAttribute>
            );
          } else {
            return (
              <InputAttribute
                key={n.id}
                idx={i}
                node={n}
                onDragStart={handleDragStart}
                isHidden={!n.name.toLowerCase().includes(searchText)}
              ></InputAttribute>
            );
          }
        })}
        <DropIndicator used={true}></DropIndicator>
      </div>

      {/*       <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "0.25rem",
            marginBottom: "0.25rem",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              color: "black",
              fontWeight: "bold",
              zIndex: 13,
            }}
          >
            <SearchOutlined />
          </span>
          <input
            onChange={(e) => updateSearch(e.target.value.toLowerCase())}
            type="text"
            style={{
              width: "16rem",
              borderColor: "#525252",
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "0.375rem",
              fontSize: "1rem",
              paddingLeft: "28px",
              zIndex: 12,
              display: "grid",
              transform: "translateX(-32px)",
            }}
          />
        </div>
      </div> */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          color: "red",
        }}
      >
        {errors?.info?.formula}
      </div>

      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Tooltip title={"Add all variables"}>
          <Button
            shape="circle"
            className={buttonStyles.coloredButton}
            onClick={() => modeAllNodes(true)}
            style={{
              height: "auto",
              padding: "10px",
              border: "2px solid",
            }}
          >
            <CopyOutlined style={{ fontSize: "20px" }} />
          </Button>
        </Tooltip>

        {save}

        <Tooltip title={"Delete all variables"}>
          <Button
            className={buttonStyles.coloredButton}
            shape="circle"
            onClick={() => modeAllNodes(false)}
            style={{
              height: "auto",
              padding: "10px",
              border: "2px solid",
            }}
          >
            <DeleteOutlined style={{ fontSize: "20px" }} />
          </Button>
        </Tooltip>
      </div>
    </>
  );
};

export default DropArea;
