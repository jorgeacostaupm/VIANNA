import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Input, Button, Typography, Space, Form } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { selectNavioVars } from "@/features/cantab/cantabSlice";
import { editData, setDataframe } from "@/features/data/dataSlice";
import { ORDER_VARIABLE } from "@/utils/Constants";
import PopoverButton from "@/utils/PopoverButton";
import appStyles from "@/utils/App.module.css";
import ColoredButton from "@/utils/ColoredButton";
import { generateAggregationBatch } from "@/features/data/modifyReducers";

const { Text } = Typography;

function EditColumn() {
  const dispatch = useDispatch();
  const [column, setColumn] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const selection = useSelector((state) => state.dataframe.selection);
  const data = useSelector((state) => state.dataframe.dataframe);
  const attributes = useSelector((state) => state.metadata.attributes);
  const vars = useSelector(selectNavioVars);

  const ids = selection?.map((item) => item[ORDER_VARIABLE]);

  const onEditSelection = () => {
    const updatedData = data.map((item) =>
      ids?.includes(item[ORDER_VARIABLE])
        ? { ...item, [column]: inputValue }
        : item
    );

    dispatch(setDataframe(updatedData));

    const matchedAggregations = attributes.filter(
      (attr) =>
        attr.type === "aggregation" &&
        attr.info?.usedAttributes?.some((d) => d.name === column)
    );

    if (matchedAggregations.length > 0) {
      dispatch(
        generateAggregationBatch({
          cols: matchedAggregations,
        })
      );
    }
  };

  return (
    <>
      <Text strong>Column to edit</Text>
      <Select
        value={column}
        onChange={setColumn}
        placeholder="Select a column to edit"
        options={vars.map((key) => ({ label: key, value: key }))}
        style={{ width: "100%" }}
      />

      <Text strong>New value</Text>

      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="New values"
        style={{ width: "100%" }}
      />

      <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
        <ColoredButton
          title={`Change selection ${column} values to ${inputValue}`}
          onClick={onEditSelection}
          icon={<EditOutlined />}
          placement={"bottom"}
        ></ColoredButton>
      </Space>
    </>
  );
}

export default function EditButton() {
  return (
    <PopoverButton
      content={<EditColumn />}
      icon={<EditOutlined />}
      title="Edit a column"
    />
  );
}
