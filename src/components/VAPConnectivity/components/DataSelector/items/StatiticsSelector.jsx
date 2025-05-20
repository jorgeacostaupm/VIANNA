import React from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setStatistics } from "@/components/VAPUtils/features/selection/selectionSlice";
import { available_statistics } from "@/components/VAPUtils/Constants";

const StatisticsSelector = () => {
  const dispatch = useDispatch();
  const statistics = available_statistics.map((statistic) => ({
    label: statistic.name,
    value: statistic.acronim,
  }));

  const onChange = (items) => {
    dispatch(setStatistics(items));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>Select Statistics:</div>
      <Select
        mode="multiple"
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        onChange={onChange}
        options={statistics}
      />
    </div>
  );
};

export default StatisticsSelector;
