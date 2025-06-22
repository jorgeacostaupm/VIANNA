import * as d3 from "d3";
import React, { useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import { UserDeleteOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";

import store from "@/features/store";
import { setDataframe } from "@/features/data/dataSlice";
import { setQuarantineData } from "@/features/cantab/cantabSlice";
import { ORDER_VARIABLE } from "@/utils/Constants";
import buttonStyles from "@/utils/Buttons.module.css";
import styles from "@/utils/Charts.module.css";

const iconStyle = { fontSize: "20px" };

const QuarantineTooltip = ({ d, idVar }) => {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.dataframe) || [];
  const quarantineData =
    useSelector((state) => state.cantab.quarantineData) || [];

  const handleQuarantineById = useCallback(() => {
    const id = d[idVar];
    const filtered = dataframe.filter((item) => item[idVar] === id);
    const remaining = dataframe.filter((item) => item[idVar] !== id);
    dispatch(setDataframe(remaining));
    dispatch(setQuarantineData([...quarantineData, ...filtered]));
  }, [dispatch, dataframe, quarantineData, d, idVar]);

  const handleQuarantineObs = useCallback(() => {
    const ord = d[ORDER_VARIABLE];
    const filtered = dataframe.filter((item) => item[ORDER_VARIABLE] === ord);
    const remaining = dataframe.filter((item) => item[ORDER_VARIABLE] !== ord);
    dispatch(setDataframe(remaining));
    dispatch(setQuarantineData([...quarantineData, ...filtered]));
  }, [dispatch, dataframe, quarantineData, d]);

  return (
    <div className={styles.hierarchyTooltip}>
      <Tooltip title={"Quarantine Observation"}>
        <Button
          className={buttonStyles.coloredButton}
          shape="circle"
          onClick={handleQuarantineObs}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
        >
          {<UserDeleteOutlined style={iconStyle} />}
        </Button>
      </Tooltip>
      {idVar && (
        <Tooltip
          title={
            "Quarantine observation and all observations sharing id variable"
          }
        >
          <Button
            className={buttonStyles.coloredButton}
            shape="circle"
            onClick={handleQuarantineById}
            style={{
              height: "auto",
              padding: "10px",
              border: "2px solid",
            }}
          >
            {<UsergroupDeleteOutlined style={iconStyle} />}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default function renderQTooltip(tooltip, d, idVar) {
  tooltip
    .style("display", "block")
    .style("background", "white")
    .style("padding", "8px");

  tooltip.html("<div id='react-tooltip-content'></div>");
  const container = document.getElementById("react-tooltip-content");

  d3.select("body").on("click", function () {
    tooltip.style("display", "none");
  });

  const root = ReactDOM.createRoot(container);
  root.render(
    <Provider store={store}>
      <QuarantineTooltip d={d} idVar={idVar} />
    </Provider>
  );
}
