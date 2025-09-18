import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Space } from "antd";
import {
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  SisternodeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import * as aq from "arquero";

import {
  addAttribute,
  removeAttribute,
} from "@/features/metadata/metaCreatorReducer";
import { pubsub } from "@/utils/pubsub";
import { ORDER_VARIABLE } from "@/utils/Constants";
import buttonStyles from "@/utils/Buttons.module.css";
import appStyles from "@/utils/App.module.css";
import PopoverButton from "@/utils/PopoverButton";

const { publish } = pubsub;

function getRandomInt(min = 0, max = 999999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function EditOptions() {
  const [maxWidth, setMaxWidth] = useState(undefined);
  const buttonRefs = useRef([]);

  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const hierarchy = useSelector((state) => state.metadata.attributes);

  useEffect(() => {
    if (buttonRefs.current.length) {
      const widths = buttonRefs.current.map((btn) => btn?.offsetWidth || 0);
      setMaxWidth(Math.max(...widths));
    }
  }, []);

  const getDataframeVariables = useCallback(() => {
    const hierarchyAggVars = hierarchy
      .filter((d) => d.type === "aggregation")
      .map((d) => d.name);

    return aq
      .from(dataframe)
      .columnNames()
      .filter(
        (colName) =>
          !hierarchyAggVars.includes(colName) && colName !== "myIdVariable"
      );
  }, [dataframe, hierarchy]);

  const getHierarchyVariables = useCallback(() => {
    const vars = hierarchy
      .filter((d) => d.type === "attribute")
      .map((d) => d.name);
    vars.push(ORDER_VARIABLE);
    return vars;
  }, [hierarchy]);

  const handleHierDataDiff = () => {
    const hierarchyVars = getHierarchyVariables();
    const datasetVars = getDataframeVariables();

    const missing = datasetVars.filter((v) => !hierarchyVars.includes(v));
    const extra = hierarchyVars.filter((v) => !datasetVars.includes(v));
    const isCoordinated = missing.length === 0 && extra.length === 0;

    publish("notification", {
      message: isCoordinated
        ? "Data and Hierarchy are Coordinated"
        : "Data and Hierarchy are Uncoordinated",
      description: isCoordinated
        ? ""
        : `Missing: ${missing.length}, Extra: ${extra.length}`,
      type: isCoordinated ? "success" : "error",
    });
  };

  const addMissingNodes = () => {
    const hierarchyVars = getHierarchyVariables();
    const datasetVars = getDataframeVariables();

    const missingVars = datasetVars.filter(
      (varName) => !hierarchyVars.includes(varName)
    );

    missingVars.forEach((varName) => {
      dispatch(
        addAttribute({
          parentID: 0,
          id: getRandomInt(),
          name: varName,
          type: "attribute",
        })
      );
    });

    publish("notification", {
      message:
        missingVars.length > 0
          ? "Missing variables added"
          : "There are no missing variables",
      description:
        missingVars.length > 0
          ? `Added: ${missingVars.length}: ${missingVars.join(", ")}`
          : "",
      type: missingVars.length > 0 ? "success" : "error",
      duration: 5,
      pauseOnHover: true,
    });
  };

  const removeExtraNodes = () => {
    const datasetVars = getDataframeVariables();

    const extraNodes = hierarchy.filter(
      (node) =>
        !datasetVars.includes(node.name) &&
        node.type !== "aggregation" &&
        node.name !== "Root"
    );

    extraNodes.forEach((node) =>
      dispatch(removeAttribute({ attributeID: node.id }))
    );

    publish("notification", {
      message:
        extraNodes.length > 0
          ? "Extra variables removed"
          : "There are no extra variables",
      description:
        extraNodes.length > 0
          ? `Removed: ${extraNodes.length}: ${extraNodes
              .map((n) => n.name)
              .join(", ")}`
          : "",
      type: extraNodes.length > 0 ? "success" : "error",
    });
  };

  return (
    <Space direction="vertical" size="middle" className={appStyles.popoverMenu}>
      {[
        "Add Missing Nodes",
        "Remove Extra Nodes",
        "Hierarchy/Data Difference",
      ].map((label, i) => (
        <Button
          key={label}
          ref={(el) => (buttonRefs.current[i] = el)}
          className={buttonStyles.coloredButton}
          style={{ width: "100%" }}
          icon={
            i === 0 ? (
              <DiffOutlined></DiffOutlined>
            ) : i === 1 ? (
              <SisternodeOutlined></SisternodeOutlined>
            ) : (
              <DeleteOutlined></DeleteOutlined>
            )
          }
          onClick={
            i === 0
              ? handleHierDataDiff
              : i === 1
              ? addMissingNodes
              : removeExtraNodes
          }
        >
          {label}
        </Button>
      ))}
    </Space>
  );
}

export default function EditButton() {
  return (
    <PopoverButton
      title={"Edit Hierarchy"}
      icon={<EditOutlined />}
      content={<EditOptions></EditOptions>}
    ></PopoverButton>
  );
}
