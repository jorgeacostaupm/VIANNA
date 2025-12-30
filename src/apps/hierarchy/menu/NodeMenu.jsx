import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pubsub } from "@/utils/pubsub";
import { Formik, Form, useFormikContext, useField } from "formik";
import { Input, Typography, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";

import { updateAttribute } from "@/store/async/metaAsyncReducers";

import { NodeBar } from "@/utils/ChartBar";
import styles from "@/utils//Charts.module.css";
import buttonStyles from "@/utils//Buttons.module.css";

import { NodeSchema } from "./NodeValidation";
import NodeInfo from "./NodeInfo";
import NodeAggregationConfig from "./NodeAggregationConfig";
import CustomMeasure from "./aggregations/CustomMeasure";
import AutoCloseTooltip from "@/utils/AutoCloseTooltip";

const { Text } = Typography;
const { publish, subscribe, unsubscribe } = pubsub;

const NodeMenu = () => {
  const [node, setNode] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [openMenu, toggleMenu] = useState(false);
  const attributes = useSelector((state) => state.metadata.attributes);
  const attributesRef = useRef(attributes);

  const dispatch = useDispatch();

  const formRef = useRef(null);
  const resizeRef = useRef();

  useEffect(() => {
    setNode(() => attributes.find((n) => n.id === nodeId));
    attributesRef.current = attributes;
  }, [attributes]);

  useEffect(() => {
    const handleNodeInspection = ({ nodeId }) => {
      const attrs = attributesRef.current;
      const foundNode = attrs.find((n) => n.id === nodeId);
      setNode(foundNode);
      setNodeId(nodeId);
      toggleMenu(nodeId != null);
    };

    const handleToggleInspect = () => {
      toggleMenu((prev) => !prev);
    };

    const handleUntoggle = () => {
      toggleMenu(false);
    };

    subscribe("nodeInspectionNode", handleNodeInspection);
    subscribe("toggleInspectMenu", handleToggleInspect);
    subscribe("untoggleEvent", handleUntoggle);

    return () => {
      unsubscribe("nodeInspectionNode", handleNodeInspection);
      unsubscribe("toggleInspectMenu", handleToggleInspect);
      unsubscribe("untoggleEvent", handleUntoggle);
    };
  }, []);

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
      const n = attributes.find((n) => n.id === i);
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
            <Form className={styles.nodeInfoBody} ref={resizeRef}>
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
                  <CustomMeasure formula={values.info.formula}></CustomMeasure>
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

export function SaveButton() {
  const { values, isValid, errors } = useFormikContext();

  return (
    <div style={{ justifyContent: "center", display: "flex" }}>
      <AutoCloseTooltip title="Save">
        <Button
          shape="circle"
          size="large"
          className={buttonStyles.coloredButton}
          htmlType="submit"
          disabled={!isValid}
          icon={<SaveOutlined />}
        ></Button>
      </AutoCloseTooltip>
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
