import React, { useMemo } from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setAtlas } from "@/components/VAPUtils/features/selection/selectionSlice";

const AtlasSelector = ({ common_atlases }) => {
  const dispatch = useDispatch();
  const atlas = useSelector((state) => state.selection.atlas);
  const atlases = useSelector((state) => state.atlas.atlases);

  const options = useMemo(() => {
    return atlases
      .filter((atlas) => common_atlases.includes(atlas.base))
      .map((atlas) => ({ label: atlas.name, value: atlas.key }));
  }, [atlases, common_atlases]);

  const onChange = (value) => {
    dispatch(setAtlas(value));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>Select Atlas:</div>
      <Select
        style={{
          width: "100%",
        }}
        placeholder="Please select"
        defaultValue={atlas}
        onChange={onChange}
        options={options}
      />
    </div>
  );
};

export default AtlasSelector;
