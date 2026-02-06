import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Button, Input } from "antd";
import { RollbackOutlined, EditOutlined } from "@ant-design/icons";

import buttonStyles from "@/styles/Buttons.module.css";
import { generateFileName } from "@/utils/functions";
import { ORDER_VARIABLE } from "@/utils/Constants";
import BarButton from "@/components/ui/BarButton";
import { setQuarantineData, selectNavioVars } from "@/store/slices/cantabSlice";
import { setDataframe } from "@/store/slices/dataSlice";

export default function RestoreDataButton() {
  const dispatch = useDispatch();
  const selection = useSelector(
    (state) => state.cantab.present.quarantineSelection
  );
  const quarantineData = useSelector(
    (state) => state.cantab.present.quarantineData
  );
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);

  function resetQuarantineSelection() {
    const ids = selection.map((item) => item[ORDER_VARIABLE]);
    const filteredData = quarantineData.filter((item) =>
      ids.includes(item[ORDER_VARIABLE])
    );
    const newQuarantineData = quarantineData.filter(
      (item) => !ids.includes(item[ORDER_VARIABLE])
    );
    const newDataframe = [...filteredData, ...dataframe];
    dispatch(setDataframe(newDataframe));
    dispatch(setQuarantineData(newQuarantineData));
  }

  return (
    <BarButton
      title={"Send selection to the Explorer"}
      onClick={resetQuarantineSelection}
      icon={<RollbackOutlined />}
    />
  );
}

function EditColumns() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const selection = useSelector(
    (state) => state.cantab.present.quarantineSelection
  );
  const data = useSelector((state) => state.cantab.present.quarantineData);
  const [column, setColumn] = useState(null);
  const vars = useSelector(selectNavioVars);
  const attributes = useSelector((state) => state.metadata.attributes);
  const ids = selection?.map((item) => item[ORDER_VARIABLE]);

  const onInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const onEditSelection = () => {
    const updatedData = data.map((item) => {
      if (ids.includes(item[ORDER_VARIABLE])) {
        return { ...item, [column]: inputValue };
      }
      return item;
    });

    dispatch(setQuarantineData(updatedData));

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
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Text strong>Select a column to edit</Text>
        <Select
          value={column}
          onChange={setColumn}
          placeholder="Select column"
          options={vars.map((key) => ({ label: key, value: key }))}
        />

        <Text strong>New value</Text>
        <Input
          value={inputValue}
          onChange={onInputChange}
          placeholder="New group name"
        />
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <BarButton
          onClick={onEditSelection}
          className={buttonStyles.barButton}
          icon={<EditOutlined />}
        />
      </div>
    </>
  );
}

function ExportButtons() {
  const allData = useSelector((state) => state.cantab.present.quarantineData);
  const selectionData = useSelector(
    (state) => state.cantab.present.quarantineSelection
  );
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns
  );

  const convertToCSV = (array) => {
    const keys = navioColumns;
    const csvRows = [keys.join(",")];

    array.forEach((obj) => {
      const values = keys.map((key) => obj[key]);
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const saveData2CSV = (data, name) => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = href;
    downloadLink.download = generateFileName(name);
    downloadLink.click();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Text strong>Export Data:</Text>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Button
          style={{ border: "2px solid" }}
          className={buttonStyles.barButton}
          onClick={() => saveData2CSV(selectionData, "selection_data")}
        >
          Selection
        </Button>
        <Button
          style={{ border: "2px solid" }}
          className={buttonStyles.barButton}
          onClick={() => saveData2CSV(allData, "all_data")}
        >
          All
        </Button>
      </div>
    </div>
  );
}
