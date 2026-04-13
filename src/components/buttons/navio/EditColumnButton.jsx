import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Input } from "antd";
import { EditOutlined, FormOutlined } from "@ant-design/icons";
import { selectNavioVars } from "@/store/features/main";
import { setDataframe } from "@/store/features/dataframe";
import { ORDER_VARIABLE } from "@/utils/constants";
import PopoverButton from "@/components/buttons/ui/PopoverButton";
import { AppButton, APP_BUTTON_PRESETS } from "@/components/buttons/core";
import { generateColumnBatch } from "@/store/features/dataframe";
import { useSelectionOrderValues } from "@/hooks/useSelectionRows";

function EditColumn() {
  const dispatch = useDispatch();
  const [column, setColumn] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const data = useSelector((state) => state.dataframe.dataframe);
  const attributes = useSelector((state) => state.metadata.attributes);
  const vars = useSelector(selectNavioVars);
  const selectedOrderValues = useSelectionOrderValues();

  const selectedOrderSet = new Set(selectedOrderValues);

  const onEditSelection = () => {
    const updatedData = data.map((item) =>
      selectedOrderSet.has(item?.[ORDER_VARIABLE])
        ? { ...item, [column]: inputValue }
        : item,
    );

    dispatch(setDataframe(updatedData));

    const matchedAggregations = attributes.filter(
      (attr) =>
        attr.type === "aggregation" &&
        attr.info?.usedAttributes?.some((d) => d.name === column),
    );

    if (matchedAggregations.length > 0) {
      dispatch(
        generateColumnBatch({
          cols: matchedAggregations,
        }),
      );
    }
  };

  return (
    <>
      <div style={{ display: "flex", width: "100%", gap: 8 }}>
        <Select
          value={column}
          onChange={setColumn}
          showSearch
          placeholder="Select a column to edit"
          options={vars.map((key) => ({ label: key, value: key }))}
          style={{ flex: 1 }}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        />
      </div>

      <div style={{ display: "flex", width: "100%", gap: 8 }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New values"
          style={{ flex: 1 }}
        />
        <AppButton
          preset={APP_BUTTON_PRESETS.TOOLBAR_ICON}
          tooltip={`Change selection ${column} values to ${inputValue}`}
          tooltipPlacement="bottom"
          onClick={onEditSelection}
          icon={<EditOutlined />}
        />
      </div>
    </>
  );
}

export default function EditColumnButton() {
  return (
    <PopoverButton
      content={<EditColumn />}
      icon={<FormOutlined />}
      title="Edit column values for selection"
    />
  );
}
