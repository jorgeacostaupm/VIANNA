import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { Switch, Tooltip, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { FileProcessorFactory } from "./drag";
import { updateData } from "@/store/async/dataAsyncReducers";
import styles from "../Data.module.css";
import ColoredButton from "@/components/ui/ColoredButton";

const { Text } = Typography;

const ACCEPTED_FORMATS = {
  "text/csv": [".csv"],
  "text/tab-separated-values": [".tsv"],
  "text/plain": [".txt"],
  "application/json": [".json"],
};

export default function DragDropData() {
  const dispatch = useDispatch();

  const [filename, setFilename] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [generateHierarchy, setGenerateHierarchy] = useState(true);

  const handleUpload = () => {
    if (parsedData) {
      dispatch(
        updateData({
          filename,
          data: parsedData,
          isGenerateHierarchy: generateHierarchy,
        }),
      );
    }
  };

  const handleFileDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];

    if (!file || !(file instanceof File)) {
      console.warn("Dropped item is not a valid file:", file);
      return;
    }

    const extension = file.name.split(".").pop().toLowerCase();

    // Validación extra por extensión
    const allowedExtensions = ["csv", "tsv", "txt", "json"];
    if (!allowedExtensions.includes(extension)) {
      console.error("File type not allowed:", extension);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const processor = FileProcessorFactory.getProcessor(extension);
        processor.process(reader.result, setParsedData);
        setFilename(file.name);
      } catch (error) {
        console.error("Processing error:", error);
      }
    };

    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    maxFiles: 1,
    accept: ACCEPTED_FORMATS,
    multiple: false,
  });

  return (
    <>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        {!isDragActive && (
          <div className={styles.dropContent}>
            {!filename && <PlusOutlined />}
            <span className={styles.text}>
              {filename || "Click or drop a file"}
            </span>
            {!filename && (
              <span className={styles.subtitle}>
                Accepted: .csv, .tsv, .txt, .json
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.switchRow}>
          <Text>Reset Hierarchy</Text>
          <Tooltip title="Start a new hierarchy">
            <Switch
              checked={generateHierarchy}
              onChange={setGenerateHierarchy}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Tooltip>
        </div>

        <ColoredButton
          onClick={handleUpload}
          disabled={!parsedData}
          icon={<UploadOutlined />}
          shape="default"
        >
          Upload Data
        </ColoredButton>
      </div>
    </>
  );
}
