import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import * as d3 from "d3";

import {
  EyeOutlined,
  SubnodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  NodeCollapseOutlined,
  ExperimentFilled,
  ExperimentOutlined,
} from "@ant-design/icons";

import { pubsub } from "@/utils/pubsub";
import buttonStyles from "@/styles/Buttons.module.css";
import styles from "@/styles/Charts.module.css";
import { addAttribute, removeAttribute } from "@/store/async/metaAsyncReducers";
import { getRandomInt } from "@/utils/functions";
import OperationModal from "./OperationModal";

const { subscribe, unsubscribe, publish } = pubsub;

export default function HierarchyContextMenu({ editor }) {
  const dispatch = useDispatch();

  const [active, setActive] = useState(false);
  const [node, setNode] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSelection, setIsSelection] = useState(false);
  const [hasSelectedNodes, setHasSelectedNodes] = useState(false);
  const [operationModalOpen, setOperationModalOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);

  const getSelectedNodes = useCallback(() => {
    return (
      editor?.svg
        .selectAll(".circleG")
        .filter(function () {
          return d3.select(this).select(".showCircle").classed("selectedNode");
        })
        .data() || []
    );
  }, [editor]);

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
        `You are going to delete node "${removedNode.data.name}".\n\nThis action cannot be undone.`,
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

    const nodes = getSelectedNodes();
    if (nodes.length === 0) return;
    setSelectedNodes(nodes);
    setOperationModalOpen(true);
  };

  const openModalSpecial = () => {
    if (!node?.parent) return;

    setSelectedNodes([node]);
    setOperationModalOpen(true);
  };

  if (!active || !node) return null;

  const nodeName = node?.data?.name || node?.name || "Node";
  const nodeType = node?.data?.type || "node";
  const selectionCount = hasSelectedNodes ? getSelectedNodes().length : 0;

  const MenuAction = ({ label, icon, onClick, danger, disabled }) => (
    <Button
      size="small"
      icon={icon}
      danger={danger}
      disabled={disabled}
      className={`${buttonStyles.myButton} ${styles.hierarchyMenuAction}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return (
    <>
      <div
        className={styles.hierarchyMenu}
        style={{
          left: position.x + 20,
          top: position.y - 10,
        }}
      >
        <div className={styles.hierarchyMenuHeader}>
          <div className={styles.hierarchyMenuTitle}>{nodeName}</div>
          <div className={styles.hierarchyMenuMeta}>
            <span>{nodeType}</span>
            {selectionCount > 0 && (
              <span>{selectionCount} selected</span>
            )}
          </div>
        </div>

        <div className={styles.hierarchyMenuSection}>
          <div className={styles.hierarchyMenuSectionTitle}>Node</div>
          <div className={styles.hierarchyMenuActions}>
            <MenuAction
              label="Inspect"
              icon={<EyeOutlined />}
              onClick={inspectNode}
            />
            <MenuAction
              label="Operate"
              icon={<ExperimentOutlined />}
              onClick={openModalSpecial}
            />
            {!isSelection && (
              <MenuAction
                label="Add Child"
                icon={<SubnodeOutlined />}
                onClick={addNode}
              />
            )}
            <MenuAction
              label="Delete"
              icon={<DeleteOutlined />}
              onClick={removeNodeById}
              danger
            />
          </div>
        </div>

        {hasSelectedNodes && (
          <div className={styles.hierarchyMenuSection}>
            <div className={styles.hierarchyMenuSectionTitle}>Selection</div>
            <div className={styles.hierarchyMenuActions}>
              {isSelection && (
                <MenuAction
                  label="Aggregate"
                  icon={<NodeCollapseOutlined />}
                  onClick={aggregateSelectedNodes}
                />
              )}
              <MenuAction
                label="Operate"
                icon={<ExperimentFilled />}
                onClick={openModal}
              />
              <MenuAction
                label="Add Selection"
                icon={<PlusOutlined />}
                onClick={addSelectedNodes}
              />
            </div>
          </div>
        )}
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
