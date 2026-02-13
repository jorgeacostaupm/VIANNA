import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import styles from "../Data.module.css";
import ColoredButton from "@/components/ui/ColoredButton";
import { updateDescriptions } from "@/store/async/metaAsyncReducers";
import { notifyError, notifyWarning } from "@/utils/notifications";

const ACCEPTED_FORMATS = {
  "text/csv": [".csv"],
};

export default function DragDropDesc() {
  const dispatch = useDispatch();

  const [filename, setFilename] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!parsedData) return;

    setIsUploading(true);
    try {
      await dispatch(
        updateDescriptions({ descriptions: parsedData, filename }),
      ).unwrap();
      setParsedData(null);
      setFilename(null);
    } catch (error) {
      notifyError({
        message: "Could not upload descriptions",
        error,
        fallback: "Descriptions upload failed. Verify CSV headers and values.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];

    if (!file) {
      notifyWarning({
        message: "Invalid file",
        description: "Select a CSV file to continue.",
      });
      return;
    }

    const reader = new FileReader();
    setIsReadingFile(true);

    reader.onload = () => {
      setParsedData(reader.result);
      setFilename(file.name);
      setIsReadingFile(false);
    };

    reader.onerror = () => {
      notifyError({
        message: "Could not read descriptions file",
        fallback: "The file could not be read.",
      });
      setIsReadingFile(false);
    };

    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    maxFiles: 1,
    accept: ACCEPTED_FORMATS,
    onDropRejected: () => {
      notifyWarning({
        message: "Unsupported file",
        description: "Accepted format: .csv",
      });
    },
  });

  return (
    <>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        {!isDragActive && (
          <div className={styles.dropContent}>
            {!filename && <PlusOutlined />}
            <span className={styles.text}>
              {isReadingFile
                ? "Reading file..."
                : filename || "Click or drop a CSV file"}
            </span>
            {!filename && (
              <span className={styles.subtitle}>Accepted: .csv</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <ColoredButton
          onClick={handleUpload}
          disabled={!parsedData || isUploading || isReadingFile}
          loading={isUploading}
          icon={<UploadOutlined />}
          shape="default"
        >
          Upload Descriptions
        </ColoredButton>
      </div>
    </>
  );
}
