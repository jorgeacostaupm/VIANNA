import { useCallback } from "react";
import { Button, Space } from "antd";
import {
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  SisternodeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import * as aq from "arquero";

import { addAttribute, removeAttribute } from "@/store/async/metaAsyncReducers";
import { pubsub } from "@/utils/pubsub";
import { ORDER_VARIABLE } from "@/utils/Constants";
import buttonStyles from "@/styles/Buttons.module.css";
import appStyles from "@/styles/App.module.css";
import PopoverButton from "@/components/ui/PopoverButton";
import { getRandomInt } from "@/utils/functions";

const { publish } = pubsub;

function EditOptions() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const hierarchy = useSelector((state) => state.metadata.attributes);

  const getDataframeVariables = useCallback(() => {
    return aq.from(dataframe).columnNames();
  }, [dataframe]);

  const getHierarchyVariables = useCallback(() => {
    const vars = hierarchy.map((d) => d.name);
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
      (varName) => !hierarchyVars.includes(varName),
    );

    missingVars.forEach((varName) => {
      dispatch(
        addAttribute({
          parentID: 0,
          id: getRandomInt(),
          name: varName,
          type: "attribute",
          dtype: "number",
        }),
      );
    });

    publish("notification", {
      message:
        missingVars.length > 0
          ? "Missing variables added"
          : "There are no missing variables",
      description:
        missingVars.length > 0
          ? `Added: ${missingVars.length} variables: ${missingVars.join(", ")}`
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
        node.name !== "Root",
    );

    extraNodes.forEach((node) =>
      dispatch(removeAttribute({ attributeID: node.id, recover: true })),
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
    <Space
      direction="vertical"
      size="middle"
      className={appStyles.popoverMenu}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {[
        "Add Missing Nodes",
        "Remove Extra Nodes",
        "Hierarchy/Data Difference",
      ].map((label, i) => (
        <Button
          key={label}
          className={buttonStyles.coloredButton}
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
              ? addMissingNodes
              : i === 1
                ? removeExtraNodes
                : handleHierDataDiff
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
      title={"Quick Edit"}
      icon={<EditOutlined />}
      content={<EditOptions></EditOptions>}
    ></PopoverButton>
  );
}
