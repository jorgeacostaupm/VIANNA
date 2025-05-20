import React from "react";
import { Button } from "antd";
import { MultiplesModal } from "./Modal";
import store from "@/components/VAPUtils/features/store";
import ViewsManager from "../../../managers/ViewsManager";
import { setLinks } from "@/components/VAPUtils/features/matrix/matrixSlice";
import { EVENTS } from "@/components/VAPUtils/Constants";

const manager = ViewsManager.getInstance();
const channel = manager.getCircularChannel();
const buttons_style = { width: "100%" };

const Interaction = (props) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        flexDirection: "column",
      }}
    >
      {!props.modal && <MultiplesModal />}

      <Button
        type="primary"
        style={buttons_style}
        onClick={onResetGeometricZoom}
      >
        Reset Geometric Zoom
      </Button>
    </div>
  );
};

function onResetSelectedLinks() {
  store.dispatch(setLinks([]));
}

function onResetGeometricZoom() {
  channel.postMessage({ type: EVENTS.RESET_CIRCULAR_GEOMETRIC_ZOOM });
}

export default Interaction;
