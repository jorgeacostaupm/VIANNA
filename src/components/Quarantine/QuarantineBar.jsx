import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  Typography,
  Space,
  Tooltip,
  Card,
  Button,
  Slider,
  Input,
} from "antd";
import {
  SettingOutlined,
  RollbackOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { updateData } from "@/features/data/dataSlice";
import {
  setQuarantineData,
  selectAllVars,
} from "@/features/cantab/cantabSlice";

import buttonStyles from "@/utils/Buttons.module.css";
import styles from "@/utils/ChartBar.module.css";
import { generateFileName } from "@/utils/functions";
import { ORDER_VARIABLE } from "@/utils/Constants";

import { ColorScales } from "../Overview/OverviewBar";
import SwitchButton from "../Overview/SwitchButton";
/* import { Settings } from "../Overview/OverviewButtons"; */

const { Text } = Typography;
const iconStyle = { fontSize: "20px" };

export default function QuarantineBar({ title, config, setConfig }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const updateConfig = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    }

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  return (
    <>
      <div className={styles.chartBar}>
        <div className={styles.chartTitle}>{title}</div>

        <div className={styles.right}>
          <RestoreData />
          <SwitchButton />
          <ColorScales />
          <Tooltip title={"Chart configuration"}>
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<SettingOutlined style={iconStyle} />}
              onClick={() => setIsVisible((prev) => !prev)}
            />
          </Tooltip>
        </div>
      </div>

      {isVisible && (
        <Card ref={cardRef} size="small" className={styles.options}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ fontSize: 16 }}>
                Attribute width:
              </Text>
              <Text type="secondary"> {config.attrWidth}px</Text>
              <Slider
                min={10}
                max={50}
                step={1}
                value={config.attrWidth}
                onChange={(v) => updateConfig("attrWidth", v)}
              />
            </div>

            <div>
              <Text strong style={{ fontSize: 16 }}>
                Label space:
              </Text>
              <Text type="secondary"> {config.y0}px</Text>
              <Slider
                min={100}
                max={200}
                step={1}
                value={config.y0}
                onChange={(v) => updateConfig("y0", v)}
              />
            </div>

            <EditColumns />
            <ExportButtons />
          </Space>
        </Card>
      )}
    </>
  );
}

function RestoreData() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.quarantineSelection);
  const quarantineData = useSelector((state) => state.cantab.quarantineData);
  const dataframe = useSelector((state) => state.dataframe.dataframe);

  function resetQuarantineSelection() {
    const ids = selection.map((item) => item[ORDER_VARIABLE]);
    const filteredData = quarantineData.filter((item) =>
      ids.includes(item[ORDER_VARIABLE])
    );
    const filteredQuarantineData = quarantineData.filter(
      (item) => !ids.includes(item[ORDER_VARIABLE])
    );
    const newData = [...filteredData, ...dataframe];
    dispatch(
      updateData({
        data: newData,
        isGenerateHierarchy: false,
        filename: "Test Data",
      })
    );
    dispatch(setQuarantineData(filteredQuarantineData));
  }

  return (
    <Tooltip title={"Send selection to Navio"}>
      <Button
        shape="circle"
        className={buttonStyles.coloredButton}
        onClick={resetQuarantineSelection}
      >
        <RollbackOutlined style={iconStyle} />
      </Button>
    </Tooltip>
  );
}

function EditColumns() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const selection = useSelector((state) => state.cantab.quarantineSelection);
  const data = useSelector((state) => state.cantab.quarantineData);
  const [column, setColumn] = useState(null);
  const vars = useSelector(selectAllVars);
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
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Text strong style={{ fontSize: 16 }}>
          Select a column to edit
        </Text>
        <Select
          value={column}
          onChange={setColumn}
          placeholder="Select column"
          options={vars.map((key) => ({ label: key, value: key }))}
        />

        <Text strong style={{ fontSize: 16 }}>
          New value
        </Text>
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
        <Tooltip
          placement="left"
          title={`Change selection ${column} values to ${inputValue}`}
        >
          <Button
            shape="circle"
            onClick={onEditSelection}
            className={buttonStyles.coloredButton}
            style={{
              height: "auto",
              padding: "10px",
              border: "2px solid",
            }}
          >
            <EditOutlined style={iconStyle} />
          </Button>
        </Tooltip>
      </div>
    </>
  );
}

function ExportButtons() {
  const allData = useSelector((state) => state.cantab.quarantineData);
  const selectionData = useSelector(
    (state) => state.cantab.quarantineSelection
  );
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

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
      <Text strong style={{ fontSize: 16 }}>
        Export Data:
      </Text>

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
          className={buttonStyles.coloredButton}
          onClick={() => saveData2CSV(selectionData, "selection_data")}
        >
          Selection
        </Button>
        <Button
          style={{ border: "2px solid" }}
          className={buttonStyles.coloredButton}
          onClick={() => saveData2CSV(allData, "all_data")}
        >
          All
        </Button>
      </div>
    </div>
  );
}
