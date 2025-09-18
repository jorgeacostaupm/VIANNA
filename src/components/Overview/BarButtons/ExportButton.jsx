import React from "react";
import { useSelector } from "react-redux";
import { Button, Typography, Space } from "antd";

import { DownloadOutlined } from "@ant-design/icons";
import { selectNavioVars } from "@/features/cantab/cantabSlice";
import { generateFileName } from "@/utils/functions";
import buttonStyles from "@/utils/Buttons.module.css";
import appStyles from "@/utils/App.module.css";
import PopoverButton from "@/utils/PopoverButton";

const { Text } = Typography;

function ExportOptions() {
  const allData = useSelector((state) => state.dataframe.dataframe);
  const selectionData = useSelector((state) => state.dataframe.selection);
  const variables = useSelector(selectNavioVars);

  const convertToCSV = (array, useAllVars = false) => {
    if (!array || array.length === 0) return "";

    const keys = useAllVars ? Object.keys(array[0]) : variables;
    const csvRows = [keys.join(",")];

    array.forEach((obj) => {
      const values = keys.map((key) => obj[key]);
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const saveData2CSV = (data, name, useAllVars = false) => {
    const csvData = convertToCSV(data, useAllVars);
    const blob = new Blob([csvData], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = href;
    downloadLink.download = generateFileName(name);
    downloadLink.click();
  };

  return (
    <Space direction="vertical" size="middle" className={appStyles.popoverMenu}>
      <Text strong>Export Options</Text>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Button
          className={buttonStyles.coloredButton}
          onClick={() => saveData2CSV(selectionData, "selection_data")}
        >
          Selection
        </Button>
        <Button
          style={{}}
          className={buttonStyles.coloredButton}
          onClick={() =>
            saveData2CSV(selectionData, "selection_data_all_vars", true)
          }
        >
          Selection + All Variables
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Button
          className={buttonStyles.coloredButton}
          onClick={() => saveData2CSV(allData, "all_data")}
        >
          Complete
        </Button>

        <Button
          className={buttonStyles.coloredButton}
          onClick={() => saveData2CSV(allData, "all_data_all_vars", true)}
        >
          Complete + All Variables
        </Button>
      </div>
    </Space>
  );
}

export default function ExportButton() {
  return (
    <PopoverButton
      content={<ExportOptions></ExportOptions>}
      icon={<DownloadOutlined></DownloadOutlined>}
      title={"Export data options"}
    ></PopoverButton>
  );
}
