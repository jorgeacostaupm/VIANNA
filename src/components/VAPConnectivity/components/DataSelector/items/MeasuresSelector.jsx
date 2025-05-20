import React from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setMeasures } from "@/components/VAPUtils/features/selection/selectionSlice";
import { available_measures } from "@/components/VAPUtils/Constants";

const MeasuresSelector = ({ common_measures }) => {
  const dispatch = useDispatch();
  const selection_measures = useSelector((state) => state.selection.measures);
  const measures = [
    ...available_measures.filter((measure) =>
      common_measures.includes(measure.acronim)
    ),
  ].map((measure) => ({
    label: measure.name,
    value: measure.acronim,
  }));

  const onChange = (items) => {
    dispatch(setMeasures(items));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>Select Measures:</div>
      <Select
        mode="multiple"
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        defaultValue={selection_measures}
        onChange={onChange}
        options={measures}
      />
    </div>
  );
};

export default MeasuresSelector;
