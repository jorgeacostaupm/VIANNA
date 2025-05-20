import { useState, useRef, useEffect } from "react";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { Button } from "antd";
import { useDispatch } from "react-redux";
import { changeRelationship } from "@/components/VAPUtils/features/metadata/metaSlice";
const { subscribe, publish, unsubscribe } = pubsub;

function EditorContextMenu() {
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

  return (
    <div
      className="editorTooltip"
      style={{
        left: position[0],
        top: position[1],
        display: active ? "flex" : "none",
      }}
    >
      <Button className="hierMenuButton" type="primary" onClick={inspectNode}>
        Inspect
      </Button>
      <Button className="hierMenuButton" type="primary" onClick={addNode}>
        Add Node
      </Button>
      <Button
        className="hierMenuButton"
        type="primary"
        onClick={addSelectedNodes}
      >
        Add Selected Nodes
      </Button>
      <Button
        className="hierMenuButton"
        type="primary"
        onClick={() => publish("removeNode", { nodeId: referencedNode.id })}
      >
        Delete Node
      </Button>
      <Button
        className="hierMenuButton"
        type="primary"
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
        Move to root
      </Button>
    </div>
  );
}

export default EditorContextMenu;
