import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { pubsub } from "@/utils/pubsub";
import { Formik, Form, useFormikContext, useField } from "formik";
import { Input, Typography, Button, Tooltip } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";

import { updateAttribute } from "@/features/metadata/metaCreatorReducer";
import { renameColumn } from "@/features/data/dataSlice";

import { NodeBar } from "@/utils/ChartBar";
import styles from "@/utils//Charts.module.css";
import buttonStyles from "@/utils//Buttons.module.css";

import { NodeSchema } from "./NodeValidation";
import NodeInfo from "./NodeInfo";
import NodeAggregationConfig from "./NodeAggregationConfig";
import CustomMeasure from "./custom/CustomMeasure";

const { Text } = Typography;

function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => obj1[key] === obj2[key]);
}

const NodeMenu = ({ nodeInfo }) => {
  const [node, setNode] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [openMenu, toggleMenu] = useState(false);

  const { publish, subscribe } = pubsub;
  const dispatch = useDispatch();

  const formRef = useRef(null);
  const resizeRef = useRef();

  useEffect(() => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
  }, [nodeInfo]);

  subscribe("nodeInspectionNode", ({ nodeId }) => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
    setNodeId(nodeId);
    toggleMenu(nodeId != null);
  });

  subscribe("toggleInspectMenu", () => {
    toggleMenu((prev) => !prev);
  });

  subscribe("untoggleEvent", () => {
    toggleMenu(false);
  });

  useEffect(() => {
    const handleUnload = () => {
      formRef.current?.handleSubmit();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  if (node == null) {
    return;
  }

  const onSubmit = async (values) => {
    dispatch(updateAttribute({ ...values, recover: true }));
  };

  const availableNodes = node.related
    .map((i) => {
      const n = nodeInfo.find((n) => n.id === i);
      if (n == null) return null;
      const isUsed =
        node.info && node.info.usedAttributes.some((u) => u.id === n.id);
      return { id: n.id, name: n.name, weight: 1, used: isUsed };
    })
    .filter((n) => n != null);

  const closeTab = () => toggleMenu((prev) => !prev);

  return (
    openMenu && (
      <div className={styles.nodeInfo}>
        <NodeBar title={"Node Menu"} remove={closeTab}></NodeBar>
        <Formik
          innerRef={formRef}
          initialValues={node}
          onSubmit={onSubmit}
          validationSchema={NodeSchema}
          validateOnMount={true}
          enableReinitialize={true}
        >
          {({ values }) => (
            <Form
              ref={resizeRef}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <NodeName />

              <NodeInfo
                nChildren={availableNodes.length}
                nodeType={node.type == null ? "root" : node.type}
                nodeId={node.id}
                DType={node.dtype}
                height={node.height}
              />
              <NodeDescriptionField />

              {values.type === "aggregation" ? (
                availableNodes.length === 0 ? (
                  <CustomMeasure
                    nodes={nodeInfo.filter((n) => n.id !== 0)}
                    formula={values.info.formula}
                    save={<SaveButton></SaveButton>}
                  ></CustomMeasure>
                ) : (
                  <NodeAggregationConfig
                    aggOp={values.info.operation || "sum"}
                    children={availableNodes}
                    vals={values}
                    save={<SaveButton></SaveButton>}
                  />
                )
              ) : (
                <SaveButton></SaveButton>
              )}
            </Form>
          )}
        </Formik>
      </div>
    )
  );
};

export default NodeMenu;

function SaveButton() {
  const { values, isValid, errors } = useFormikContext();
  /* console.log("🧪 Formula:", values.info?.formula);
  console.log("✅ isValid:", isValid);
  console.log("❌ errors:", errors); */

  return (
    <div style={{ justifyContent: "center", display: "flex" }}>
      <Tooltip title="Save">
        <Button
          shape="circle"
          className={buttonStyles.barButton}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
          htmlType="submit"
          disabled={!isValid}
        >
          <SaveOutlined style={{ fontSize: "20px" }} />
        </Button>
      </Tooltip>
    </div>
  );
}

const NodeName = () => {
  const [field] = useField("name");
  const { errors } = useFormikContext();

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
        <Text strong>Name:</Text>
        <Input
          id="name"
          {...field}
          style={{
            padding: "5px",
            flex: 1,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          color: "red",
        }}
      >
        {errors?.name}
      </div>
    </>
  );
};
function NodeDescriptionField() {
  const [field, meta, helpers] = useField("desc");

  function onChange(e) {
    const value = e.target.value;
    helpers.setValue(value);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Text strong>Description:</Text>
      <Input.TextArea
        id="desc"
        {...field}
        rows={4}
        onChange={onChange}
        value={field.value}
      />
    </div>
  );
}
