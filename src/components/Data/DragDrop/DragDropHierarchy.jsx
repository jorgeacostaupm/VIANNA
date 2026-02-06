import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import { FileProcessorFactory } from "./drag";
import styles from "../Data.module.css";
import { updateHierarchy } from "@/store/async/metaAsyncReducers";
import ColoredButton from "@/components/ui/ColoredButton";

const ACCEPTED_FORMATS = {
  "application/json": [".json"],
};

export default function DragAndDropHierarchy() {
  const dispatch = useDispatch();
  const [filename, setFilename] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleUpload = () => {
    if (parsedData) {
      dispatch(
        updateHierarchy({
          filename,
          hierarchy: parsedData,
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

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension !== "json") {
      console.error("Only JSON files are allowed");
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
  });

  return (
    <>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        {!isDragActive && (
          <div className={styles.dropContent}>
            {!filename && <PlusOutlined />}
            <span className={styles.text}>
              {filename || "Click or drop a JSON file"}
            </span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <ColoredButton
          onClick={handleUpload}
          disabled={!parsedData}
          icon={<UploadOutlined />}
          shape="default"
        >
          Upload Hieararchy
        </ColoredButton>
      </div>
    </>
  );
}
