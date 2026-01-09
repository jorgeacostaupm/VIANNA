import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button, Tooltip } from "antd";
import * as d3 from "d3";

import {
  EyeOutlined,
  SubnodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  NodeCollapseOutlined,
} from "@ant-design/icons";

import { pubsub } from "@/utils/pubsub";
import buttonStyles from "@/utils/Buttons.module.css";
import styles from "@/utils/Charts.module.css";
import { addAttribute, removeAttribute } from "@/store/async/metaAsyncReducers";
import { getRandomInt } from "@/utils/functions";
import OperationModal from "./OperationModal";

const { subscribe, unsubscribe, publish } = pubsub;

export default function HierarchyEditorContextMenu({ editor }) {
  const dispatch = useDispatch();

  const [active, setActive] = useState(false);
  const [node, setNode] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSelection, setIsSelection] = useState(false);
  const [hasSelectedNodes, setHasSelectedNodes] = useState(false);
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const handleToggle = useCallback((data) => {
    if (!data?.node || !data?.position) return;

    setNode(data.node);
    setPosition({ x: data.position.x, y: data.position.y });
    setIsSelection(Boolean(data.isSelectedNode));
    setHasSelectedNodes(Boolean(data.hasSelectedNodes));
    setActive(true);
  }, []);

  const handleUntoggle = useCallback(() => {
    setNode(null);
    setActive(false);
  }, []);

  useEffect(() => {
    subscribe("toggleEvent", handleToggle);
    subscribe("untoggleEvent", handleUntoggle);

    return () => {
      unsubscribe("toggleEvent", handleToggle);
      unsubscribe("untoggleEvent", handleUntoggle);
    };
  }, [handleToggle, handleUntoggle]);

  const inspectNode = () => {
    if (!node) return;
    publish("inspectNode", { nodeId: node.id });
    setActive(false);
  };

  const addNode = () => {
    if (!node) return;

    const newNode = {
      id: getRandomInt(),
      name: `Node ${editor.nNodes + 1}`,
      type: "aggregation",
    };

    dispatch(addAttribute({ parentID: node.id, ...newNode }));
    publish("nodeInspectionNode", { nodeId: newNode.id, required: true });
    setActive(false);
  };

  const removeNodeById = () => {
    if (!node) return;

    const removedNode = editor.root
      .descendants()
      .find((n) => n.data.id === node.id);

    if (
      removedNode?.data?.type === "attribute" &&
      !window.confirm(
        `You are going to delete node "${removedNode.data.name}".\n\nThis action cannot be undone.`
      )
    ) {
      publish("untoggleEvent");
      return;
    }

    dispatch(removeAttribute({ attributeID: node.id }));
    publish("untoggleEvent");
  };

  const aggregateSelectedNodes = () => {
    if (!node?.parent) return;

    publish("aggregateSelectedNodes", {
      parent: node.parent.id,
      source: node.id,
    });

    setActive(false);
  };

  const addSelectedNodes = () => {
    if (!node) return;

    publish("addSelectedNodes", { parent: node.id });
    setActive(false);
  };

  const openModal = () => {
    if (!node?.parent) return;

    const nodes = editor?.svg
      .selectAll(".circleG")
      .filter(function () {
        return d3.select(this).select(".showCircle").classed("selectedNode");
      })
      .data();

    setSelectedNodes(nodes);
    setOperationModalOpen(true);
  };

  if (!active || !node) return null;

  return (
    <>
      <div
        className={styles.hierarchyTooltip}
        style={{
          left: position.x + 20,
          top: position.y - 10,
        }}
      >
        <Tooltip title="Inspect node">
          <Button
            shape="circle"
            className={buttonStyles.borderedButton}
            onClick={inspectNode}
          >
            <EyeOutlined />
          </Button>
        </Tooltip>

        {isSelection ? (
          <>
            <Tooltip title="Aggregate selected nodes">
              <Button
                shape="circle"
                className={buttonStyles.borderedButton}
                onClick={aggregateSelectedNodes}
              >
                <NodeCollapseOutlined />
              </Button>
            </Tooltip>
            <Tooltip title="Apply Operation">
              <Button
                shape="circle"
                className={buttonStyles.borderedButton}
                onClick={openModal}
              >
                <NodeCollapseOutlined />
              </Button>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Add node">
            <Button
              shape="circle"
              className={buttonStyles.borderedButton}
              onClick={addNode}
            >
              <SubnodeOutlined />
            </Button>
          </Tooltip>
        )}

        {hasSelectedNodes && (
          <Tooltip title="Add selected nodes">
            <Button
              shape="circle"
              className={buttonStyles.borderedButton}
              onClick={addSelectedNodes}
            >
              <PlusOutlined />
            </Button>
          </Tooltip>
        )}

        <Tooltip title="Delete node">
          <Button
            shape="circle"
            className={buttonStyles.borderedButton}
            onClick={removeNodeById}
          >
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </div>
      <OperationModal
        node={node}
        selectedNodes={selectedNodes}
        open={operationModalOpen}
        setOpen={setOperationModalOpen}
        setActive={setActive}
      />
    </>
  );
}
