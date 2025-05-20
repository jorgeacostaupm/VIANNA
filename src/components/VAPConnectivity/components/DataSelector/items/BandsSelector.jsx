import React from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setBands } from "@/components/VAPUtils/features/selection/selectionSlice";
import { available_bands } from "@/components/VAPUtils/Constants";

const BandsSelector = ({ common_bands }) => {
  const dispatch = useDispatch();
  const selection_bands = useSelector((state) => state.selection.bands);
  const bands = available_bands
    .filter((band) => common_bands.includes(band.acronim))
    .map((band) => ({
      label: band.name,
      value: band.acronim,
    }));

  const onChange = (items) => {
    dispatch(setBands(items));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>Select Bands:</div>
      <Select
        mode="multiple"
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        defaultValue={selection_bands}
        onChange={onChange}
        options={bands}
      />
    </div>
  );
};

export default BandsSelector;
