import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Typography, Divider } from "antd";
import DragDropData from "../DragDrop/DragDropData";
import NullifyValuesPanel from "../NullifyValuesPanel";
import { setIdVar } from "@/store/slices/cantabSlice";
import {
  selectNavioVars,
  selectCategoricalVars,
  selectNumericVars,
  selectUnkownVars,
} from "@/store/slices/cantabSlice";
import styles from "../Data.module.css";

const { Title, Text } = Typography;
const formatPreview = (arr, max = 12) => {
  if (!arr || arr.length === 0) return "—";
  const preview = arr.slice(0, max);
  const remaining = arr.length - preview.length;
  return remaining > 0
    ? `${preview.join(", ")} (+${remaining} more)`
    : preview.join(", ");
};

const Info = () => {
  const filename = useSelector((state) => state.dataframe.present.filename);
  const dt = useSelector((state) => state.dataframe.present.dataframe);
  const vars = useSelector(selectNavioVars);
  const numericVars = useSelector(selectNumericVars);
  const categoricalVars = useSelector(selectCategoricalVars);
  const unknownVars = useSelector(selectUnkownVars);

  return (
    <div className={styles.tabColumn}>
      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Metadata
      </Title>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          File Name:
        </Text>{" "}
        <Text>{filename ? filename : "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Rows:
        </Text>{" "}
        <Text>{dt?.length || 0}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Summary
      </Title>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Numeric:
        </Text>{" "}
        <Text>{numericVars?.length || 0}</Text>
      </div>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Categorical:
        </Text>{" "}
        <Text>{categoricalVars?.length || 0}</Text>
      </div>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Unknown:
        </Text>{" "}
        <Text>{unknownVars?.length || 0}</Text>
      </div>
      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Visible measurements:
        </Text>{" "}
        <Text>{formatPreview(vars)}</Text>
      </div>
      <Divider style={{ margin: "0.75rem 0" }} />
      <Title level={5} style={{ margin: 0, color: "var(--primary-color)" }}>
        Expected File
      </Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Text type="secondary">
          Rows are observations and each field is a measurement.
        </Text>
        <Text type="secondary">
          For JSON, upload an array of objects and make sure every object shares
          the same keys.
        </Text>
        <Text type="secondary">
          Missing values can be left blank and will be treated as nulls.
        </Text>
      </div>
    </div>
  );
};

const UploadPanel = () => {
  const dispatch = useDispatch();
  const idVar = useSelector((state) => state.cantab.present.idVar);
  const vars = useSelector(selectNavioVars);

  const handleChange = useCallback(
    (setter) => (value) => dispatch(setter(value)),
    [dispatch],
  );

  return (
    <div
      className={`${styles.tabColumn} ${styles.tabColumnWithDivider} ${styles.tabColumnScrollable}`}
    >
      <Title
        level={4}
        style={{ marginBottom: 4, color: "var(--primary-color)" }}
      >
        Upload Data
      </Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Text type="secondary">
          Each column becomes a measurement. Types are detected automatically
          from the values.
        </Text>
      </div>

      <DragDropData />

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Configuration Measurements
      </Title>
      <Text type="secondary">
        Set the unique identifier used across analysis views.
      </Text>

      {[
        ["ID measurement", idVar, setIdVar],
      ].map(([label, value, setter]) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text strong style={{ color: "var(--primary-color)" }}>
            {label}:
          </Text>
          <Select
            style={{ width: "60%", marginTop: 0 }}
            value={value}
            onChange={handleChange(setter)}
            placeholder={`Select ${label.toLowerCase()}`}
            options={vars.map((key) => ({ label: key, value: key }))}
          />
        </div>
      ))}

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginBottom: 4, color: "var(--primary-color)" }}>
        Nullify Values
      </Title>
      <Text type="secondary">
        Replace exact values with null across Explorer and Quarantine.
      </Text>
      <NullifyValuesPanel />
    </div>
  );
};

export default function TabData() {
  return (
    <div className={styles.tabSplit}>
      <Info />
      <UploadPanel />
    </div>
  );
}
