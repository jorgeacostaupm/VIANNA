import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { Button, Switch, Tooltip, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { FileProcessorFactory } from "./drag";
import { updateData } from "@/features/data/dataSlice";
import buttonStyles from "@/utils/Buttons.module.css";
import styles from "./Data.module.css";

const { Text } = Typography;

const iconStyle = { fontSize: "24px" };
const ACCEPTED_FORMATS = ".csv, .tsv, .txt, .xls, .xlsx, .json";

export default function DragDropData() {
  const dispatch = useDispatch();
  const notApi = useSelector((state) => state.cantab.notApi);

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

  const handleFileDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles?.[0];

      if (!file || !(file instanceof File)) {
        console.warn("Dropped item is not a valid file:", file);
        return;
      }

      const reader = new FileReader();
      const extension = file.name.split(".").pop().toLowerCase();

      reader.onload = () => {
        try {
          const processor = FileProcessorFactory.getProcessor(extension);
          processor.process(reader.result, setParsedData);
          setFilename(file.name);
        } catch (error) {
          notApi.error({
            message: "Error processing file",
            description: error.message,
            placement: "bottomRight",
            duration: 3,
          });
          console.error("Processing error:", error);
        }
      };

      if (["xls", "xlsx"].includes(extension)) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    },
    [notApi]
  );

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

        <Tooltip title="Upload parsed data">
          <Button
            shape="circle"
            className={buttonStyles.coloredButton}
            onClick={handleUpload}
            disabled={!parsedData}
            style={{
              height: "auto",
              padding: "20px",
              border: "2px solid",
            }}
          >
            <UploadOutlined style={iconStyle} />
          </Button>
        </Tooltip>
      </div>
    </>
  );
}
