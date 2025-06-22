import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Tooltip } from "antd";
import {
  EyeOutlined,
  SubnodeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { pubsub } from "@/utils/pubsub";
import buttonStyles from "@/utils/Buttons.module.css";
import styles from "@/utils/Charts.module.css";

const { subscribe, publish, unsubscribe } = pubsub;

export default function EditorContextMenu() {
  const [active, toggleActive] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const [referencedNode, referNode] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    subscribe("toggleEvent", toggleEvent);
    subscribe("untoggleEvent", untoggleEvent);

    return () => {
      unsubscribe("toggleEvent", toggleEvent);
      unsubscribe("untoggleEvent", untoggleEvent);
    };
  }, []);

  function toggleEvent(data) {
    const { node, position } = data;
    toggleActive(true);
    referNode(node);
    setPosition([position.x, position.y]);
  }

  function untoggleEvent(data) {
    referNode(null);
    toggleActive(false);
  }

  function addNode() {
    if (referencedNode == null) {
      return;
    }
    publish("addNodeEvent", { parent: referencedNode.id });
    toggleActive(false);
  }

  function addSelectedNodes() {
    if (referencedNode == null) {
      return;
    }
    publish("addSelectedNodes", { parent: referencedNode.id });
    toggleActive(false);
  }

  function inspectNode() {
    if (referencedNode == null) {
      return;
    }
    publish("inspectViewNode", { nodeId: referencedNode.id });
    toggleActive(false);
  }

  return active ? (
    <div
      className={styles.hierarchyTooltip}
      style={{
        left: position[0] + 20,
        top: position[1] - 50,
      }}
    >
      <Tooltip title={"Inspect node"}>
        <Button
          shape="circle"
          className={buttonStyles.borderedButton}
          onClick={inspectNode}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
        >
          <EyeOutlined />
        </Button>
      </Tooltip>

      <Tooltip title={"Add node"}>
        <Button
          shape="circle"
          className={buttonStyles.borderedButton}
          onClick={addNode}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
        >
          <SubnodeOutlined></SubnodeOutlined>
        </Button>
      </Tooltip>

      <Tooltip title={"Add selected nodes"}>
        <Button
          shape="circle"
          className={buttonStyles.borderedButton}
          onClick={addSelectedNodes}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
        >
          <PlusOutlined></PlusOutlined>
        </Button>
      </Tooltip>

      <Tooltip title={"Delete node"}>
        <Button
          shape="circle"
          className={buttonStyles.borderedButton}
          onClick={() => publish("removeNode", { nodeId: referencedNode.id })}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
        >
          <DeleteOutlined></DeleteOutlined>
        </Button>
      </Tooltip>

      {/* <Button
        shape="circle"
        className={buttonStyles.borderedButton}
        onClick={() =>
          dispatch(
            changeRelationship({
              source: referencedNode.id,
              target: 0,
              recover: true,
            })
          )
        }
      >
        Move to Root
      </Button> */}
    </div>
  ) : null;
}
