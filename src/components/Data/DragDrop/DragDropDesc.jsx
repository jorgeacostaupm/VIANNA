import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import styles from "../Data.module.css";
import ColoredButton from "@/utils/ColoredButton";
import { updateDescriptions } from "@/store/async/metaAsyncReducers";

const ACCEPTED_FORMATS = ".csv";

export default function DragDropDesc() {
  const dispatch = useDispatch();

  const [filename, setFilename] = useState(null);
  const [parsedData, setParsedData] = useState(null); // ahora es string

  const handleUpload = () => {
    if (parsedData) {
      console.log(parsedData); // texto completo del CSV
      dispatch(updateDescriptions({ descriptions: parsedData, filename }));
    }
  };

  const handleFileDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setParsedData(reader.result); // 👈 texto plano
      setFilename(file.name);
    };

    reader.onerror = () => {
      console.error("Error reading file");
    };

    reader.readAsText(file); // 👈 SIEMPRE texto
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
              {filename || "Click or drop a CSV file"}
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
        <ColoredButton
          onClick={handleUpload}
          disabled={!parsedData}
          icon={<UploadOutlined />}
          shape="default"
        >
          Upload Descriptions
        </ColoredButton>
      </div>
    </>
  );
}
