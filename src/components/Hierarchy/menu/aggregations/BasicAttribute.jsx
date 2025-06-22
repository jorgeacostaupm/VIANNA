import { Field } from "formik";
import { motion } from "framer-motion";
import DropIndicator from "./DropIndicator";
import { Tooltip } from "antd";

const BasicAttribute = ({ idx, node, onDragStart, isHidden = false }) => {
  return (
    <div
      style={{
        display: isHidden ? "none" : "flex",
        width: "100%",
        alignSelf: "center",
        justifySelf: "center",
      }}
    >
      <DropIndicator used={`${node.used}`} nodeID={node.id}></DropIndicator>
      <motion.div
        layout
        layoutId={node.id}
        id={`info.usedAttributes.${idx}`}
        draggable={true}
        onDragStart={(e) => onDragStart(e, { id: node.id, name: node.name })}
        style={{
          display: "flex",
          cursor: "grab",
          padding: "0.5rem",
          border: "1px solid",
          borderRadius: "0.75rem",
          background: "transparent",
          overflow: "hidden",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Tooltip title={node.name}>
          <Field
            as="div"
            id={`info.usedAttributes.${idx}.name`}
            name={`info.usedAttributes.${idx}.name`}
            title={node.name || ""}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.125rem",
            }}
          >
            {node.name}
          </Field>
        </Tooltip>
      </motion.div>
    </div>
  );
};

export default BasicAttribute;
