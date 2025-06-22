import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";

import store from "@/features/store";
import {
  addAttribute,
  removeAttribute,
  updateAttribute,
} from "@/features/metadata/metaCreatorReducer";
import { undoOperation, setInit } from "@/features/metadata/metaSlice";

import D3HierarchyEditor from "./D3HierarchyEditor";
import EditorContextMenu from "./tools/EditorContextMenu";
import NodeMenu from "./menu/NodeMenu";
import PerModal from "./persistance/PerModal";
import AutoHierModal from "./auto-hier/AutoHierModal";
import { generateFormulaSimplified } from "./menu/logic/simplifiedFormulas";

import useResizeObserver from "@/utils/useResizeObserver";
import useRootStyles from "@/utils/useRootStyles";
import { generateTree } from "@/utils/functions";
import styles from "@/utils/Charts.module.css";
import { Bar } from "@/utils/ChartBar";
import { Apps } from "@/utils/Constants";
import { pubsub } from "@/utils/pubsub";
import { HierarchyButtons } from "./Buttons";
import NoDataPlaceholder from "../../utils/NoDataPlaceholder";

let editor = null;
let treeData;
const { subscribe, unsubscribe, publish } = pubsub;

const getTree = createSelector(
  (state) => state.metadata,
  (meta) => {
    treeData = generateTree(meta.attributes, 0);
    return meta;
  }
);

export default function HierarchyEditor() {
  const attributes = useSelector((state) => state.metadata.attributes);

  useRootStyles(
    { padding: "0px 0px", maxWidth: "100vw" },
    setInit,
    Apps.HIERARCHY
  );

  return (
    <div className={styles.viewContainer}>
      <Bar title={"Hierarchy Editor"} drag={false}>
        <HierarchyButtons></HierarchyButtons>
      </Bar>
      {attributes?.length > 0 ? (
        <Hierarchy />
      ) : (
        <NoDataPlaceholder message="No hierarchy available" />
      )}
    </div>
  );
}

function Hierarchy() {
  const dispatch = useDispatch();

  const version = useSelector((state) => state.metadata.version);
  const attributes = useSelector((state) => state.metadata.attributes);
  const metadata = useSelector(getTree);
  const containerRef = useRef(null);

  const dimensions = useResizeObserver(containerRef);
  useEffect(() => {
    editor && editor.onResize(dimensions);
  }, [dimensions]);

  useEffect(() => {
    if (attributes.length > 1) {
      const treeData = generateTree(attributes, 0);
      if (editor == null) {
        const tmp = new D3HierarchyEditor(
          containerRef.current,
          treeData,
          dispatch
        );
        tmp.updateData(treeData);
        editor = tmp;
        return;
      } else {
        editor.updateData(treeData);
      }
    }

    return () => {};
  }, [version, attributes]);

  useEffect(() => {
    // Some key functions, probably they would not be used...
    document.addEventListener("keydown", editorShortcuts);

    function addNode({ parent }) {
      const newNode = {
        id: getRandomInt(0, 9999999) + editor.nNodes,
        name: `Aggregation ${editor.nNodes + 1}`,
        type: "aggregation",
      };

      // const newData = addNode(treeData, parent, newNode);
      //editor.updateData(newData, targetId);
      dispatch(addAttribute({ parentID: parent, ...newNode }));
      publish("nodeInspectionNode", { nodeId: newNode.id, required: true });
    }

    function removeNode({ nodeId }) {
      let requiredInspection = false;

      const removedNode = editor.root
        .descendants()
        .find((n) => n.data.id === nodeId);
      // Allow avoid to remove node.
      if (removedNode && removedNode.data.type === "attribute") {
        const userConfirm = confirm(
          "You are going to delete node " + removedNode.data.name
        );
        if (!userConfirm) {
          publish("untoggleEvent", {});
          return;
        }
      }

      const parentID = removedNode?.parent.data.id;
      const attributes = store.getState().metadata.attributes;

      const parentNode = attributes.find((n) => n.id === parentID);
      if (parentNode != null && parentNode.id !== 0) {
        let parent = deepCopy(parentNode);
        if (parent.type === "aggregation") {
          if (parent.info.operation !== "custom") {
            parent.info.usedAttributes = parent.info.usedAttributes.filter(
              (n) => n.id !== nodeId
            );

            if (parent.info.usedAttributes.length == 0) {
              parent.info = { ...parent.info, formula: "", exec: "" };
              publish("addAlertNotification", {
                type: "warn",
                msg: `El nodo "${parent.name}" ya no agrega ninguna información.`,
                click: () => {
                  publish("nodeInspectionNode", { nodeId: parent.id });
                },
              });
            } else {
              const newFormula = generateFormulaSimplified(
                parent.info.operation,
                parent.info.usedAttributes
              );
              if (!newFormula.valid) {
                publish("addAlertNotification", {
                  type: "warn",
                  msg: "Fallo de modificación de agregación tras eliminación",
                  click: () => {
                    publish("nodeInspectionNode", { nodeId: parent.id });
                  },
                });
                requiredInspection = true;
              } else {
                parent.info = {
                  ...parent.info,
                  formula: newFormula.formula,
                  exec: newFormula.exec,
                };
              }
            }
          } else {
            parent.info = { ...parent.info, formula: "", exec: "" };
            publish("addAlertNotification", {
              type: "warn",
              msg: "No es posible corregir fórmulas customizadas.",
              click: () => {
                publish("nodeInspectionNode", { nodeId: parent.id });
              },
            });
            requiredInspection = true;
          }
        }
        dispatch(updateAttribute(parent));
      } else {
        publish("nodeInspectionNode", { nodeId: null });
      }

      publish("untoggleEvent", {});
      dispatch(removeAttribute({ attributeID: nodeId }));
      if (requiredInspection)
        publish("nodeInspectionNode", { nodeId: parent.id, required: true });
    }

    subscribe("addNodeEvent", addNode);

    subscribe("removeNode", removeNode);

    return () => {
      document.removeEventListener("keydown", editorShortcuts);
      unsubscribe("addNodeEvent", addNode);
      unsubscribe("removeNode", removeNode);
      editor = null;
    };
  }, []);

  return (
    <>
      <div
        id="hier-editor"
        style={{ textAlign: "initial" }}
        className={styles.editorContainer}
        ref={containerRef}
      ></div>
      <EditorContextMenu></EditorContextMenu>
      <NodeMenu nodeInfo={metadata.attributes}></NodeMenu>
    </>
  );
}

function editorShortcuts(event) {
  if (event.target.matches("input, textarea")) return;

  const key = event.key.toLowerCase();
  switch (key) {
    case "e":
      publish("toggleInspectMenu", {});
      break;
    case "s":
      if (event.ctrlKey) {
        openImportModal("persistance");
      } else {
        const search = document.getElementById("search-node-bar");
        if (search) search.focus();
      }
      break;

    case "c":
      publish("toggleBackgroundEvent", {});
      break;

    case "a":
      event.preventDefault();
      publish("zoomInteractionEvent", { resetPosition: true });
      break;

    case "-":
      publish("zoomInteractionEvent", { zoomRelative: 0.5 });
      break;

    case "+":
      publish("zoomInteractionEvent", { zoomRelative: 2 });
      break;

    case "z":
      if (event.ctrlKey) dispatch(undoOperation());
      break;
    default:
      return;
  }
}

function getRandomInt(min = 0, max = 999999) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
