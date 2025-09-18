import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import { FileProcessorFactory } from "./drag";

import styles from "../Data.module.css";
import { setDescriptions } from "../../../features/metadata/metaSlice";
import BarButton from "@/utils/BarButton";

const ACCEPTED_FORMATS = ".csv";

export default function DragDropDesc() {
  const dispatch = useDispatch();
  const hierarchy = useSelector((state) => state.metadata.attributes);

  const [filename, setFilename] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleUpload = () => {
    if (parsedData) {
      console.log(parsedData);
      dispatch(setDescriptions(parsedData));
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
        <BarButton
          title="Upload parsed data"
          onClick={handleUpload}
          disabled={!parsedData || !hierarchy}
          icon={<UploadOutlined />}
        />
      </div>
    </>
  );
}
