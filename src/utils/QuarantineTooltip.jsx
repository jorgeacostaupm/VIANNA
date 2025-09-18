import * as d3 from "d3";
import React, { useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { UserDeleteOutlined, UsergroupDeleteOutlined } from "@ant-design/icons";

import store from "@/features/store";
import { setDataframe } from "@/features/data/dataSlice";
import { setQuarantineData } from "@/features/cantab/cantabSlice";
import { ORDER_VARIABLE } from "@/utils/Constants";
import styles from "@/utils/Charts.module.css";
import BarButton from "./BarButton";

const QuarantineObservationTooltip = ({ d, idVar }) => {
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
      <BarButton
        title={"Quarantine Observation"}
        onClick={handleQuarantineObs}
        icont={<UserDeleteOutlined />}
      />
      {idVar && (
        <BarButton
          title={
            "Quarantine observation and all observations sharing id variable"
          }
          onClick={handleQuarantineById}
          icon={<UsergroupDeleteOutlined />}
        />
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
      <QuarantineObservationTooltip d={d} idVar={idVar} />
    </Provider>
  );
}
