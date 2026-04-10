import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Radio } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { selectNavioVars } from "@/store/features/main";
import { ORDER_VARIABLE } from "@/utils/Constants";
import { generateFileName } from "@/utils/functions";
import PopoverButton from "@/components/ui/PopoverButton";
import { AppButton, APP_BUTTON_VARIANTS } from "@/components/ui/button";
import styles from "./ExportButton.module.css";
import { useSelectionOrderValues } from "@/hooks/useSelectionRows";

function ExportOptions() {
  const fullData = useSelector((state) => state.dataframe.dataframe);
  const visibleVariables = useSelector(selectNavioVars);
  const selectedOrderValues = useSelectionOrderValues();
  const [includeAllVars, setIncludeAllVars] = useState(false);
  const selectionRows = useMemo(() => {
    const selectedOrderSet = new Set(selectedOrderValues);
    return (Array.isArray(fullData) ? fullData : []).filter((row) =>
      selectedOrderSet.has(row?.[ORDER_VARIABLE]),
    );
  }, [fullData, selectedOrderValues]);

  const buildCsv = (rows, includeAllVars = false) => {
    if (!rows || rows.length === 0) return "";

    const keys = includeAllVars ? Object.keys(rows[0]) : visibleVariables;
    const csvRows = [keys.join(",")];

    rows.forEach((obj) => {
      const values = keys.map((key) => obj[key]);
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const downloadCsv = (rows, name, includeAllVars = false) => {
    const csvData = buildCsv(rows, includeAllVars);
    const blob = new Blob([csvData], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = href;
    downloadLink.download = generateFileName(name);
    downloadLink.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <AppButton
          variant={APP_BUTTON_VARIANTS.ACTION}
          className={styles.exportButton}
          onClick={() =>
            downloadCsv(
              selectionRows,
              includeAllVars ? "selection_all_vars" : "selection_visible_vars",
              includeAllVars,
            )
          }
        >
          Selection
        </AppButton>
        <AppButton
          variant={APP_BUTTON_VARIANTS.ACTION}
          className={styles.exportButton}
          onClick={() =>
            downloadCsv(
              fullData,
              includeAllVars ? "all_all_vars" : "all_visible_vars",
              includeAllVars,
            )
          }
        >
          All data
        </AppButton>
      </div>

      <div className={styles.row}>
        <Radio.Group
          value={includeAllVars ? "all" : "visible"}
          onChange={(event) => setIncludeAllVars(event.target.value === "all")}
          className={styles.toggle}
        >
          <Radio.Button value="visible">Visible variables</Radio.Button>
          <Radio.Button value="all">All variables</Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
}

export default function ExportButton() {
  return (
    <PopoverButton
      content={<ExportOptions />}
      icon={<DownloadOutlined />}
      title={"Export data"}
    />
  );
}
