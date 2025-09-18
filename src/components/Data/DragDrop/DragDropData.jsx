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
import { updateData } from "@/features/data/dataSlice";
import styles from "../Data.module.css";
import BarButton from "@/utils/BarButton";

const { Text } = Typography;

const ACCEPTED_FORMATS = ".csv, .tsv, .txt, .xls, .xlsx, .json";

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
        })
      );
    }
  };

  const handleFileDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];

    if (!file || !(file instanceof File)) {
      console.warn("Dropped item is not a valid file:", file);
      return;
    }

    const reader = new FileReader();
    const extension = file.name.split(".").pop().toLowerCase();
    console.log(extension);

    reader.onload = () => {
      try {
        const processor = FileProcessorFactory.getProcessor(extension);
        processor.process(reader.result, setParsedData);
        setFilename(file.name);
      } catch (error) {
        console.error("Processing error:", error);
      }
    };

    if (["xls", "xlsx"].includes(extension)) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
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
                Accepted: {ACCEPTED_FORMATS}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.switchRow}>
          <Text>Generate hierarchy</Text>
          <Tooltip title="Toggle automatic hierarchy generation">
            <Switch
              checked={generateHierarchy}
              onChange={setGenerateHierarchy}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Tooltip>
        </div>

        <BarButton
          title="Upload parsed data"
          onClick={handleUpload}
          disabled={!parsedData}
          icon={<UploadOutlined />}
        />
      </div>
    </>
  );
}
