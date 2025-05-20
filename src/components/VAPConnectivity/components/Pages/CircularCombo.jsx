import React from "react";
import ViewLinks from "../List/ViewLinks";
import AtlasView from "../Atlas";
import CircularApp from "../Circular";

export const CircularCombo = (props) => {
  document.title = "Matrix + Atlas + List";

  console.log("RENDERING CIRCULARCOMBOAPP...");
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: 0,
            width: "100%",
            height: "73%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "2%",
            justifyContent: "space-evenly",
            alignContent: "middle",
          }}
        >
          <div style={{ width: "45%", height: "95%" }}>
            <AtlasView />
          </div>
          <div style={{ width: "45%", height: "95%" }}>
            <CircularApp combined={true} />
          </div>
        </div>

        {
          <div
            style={{
              width: "100%",
              height: "30%",
            }}
          >
            <ViewLinks pageSize={2} />
          </div>
        }
      </div>
    </>
  );
};

export default CircularCombo;
