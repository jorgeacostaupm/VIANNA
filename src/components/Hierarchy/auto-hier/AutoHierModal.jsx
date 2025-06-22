import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";

import Progress from "./Progress";
import ClusteringProcess from "./ClusteringProcess";
import { pubsub } from "@/utils/pubsub";
import { fetchTestData } from "@/utils/cantabAppServices";

let worker = null;
const AutoHierModal = ({ setOpen, isModalOpen, setIsModalOpen }) => {
  const { subscribe, publish } = pubsub;

  const [process, setProcess] = useState("npl-cluster");
  const [progress, setProgress] = useState([]);

  const selectAttributes = (state) => state.metadata.attributes;
  const attributes = useSelector(selectAttributes).filter(
    (m) => m.type === "attribute"
  );

  if (worker == null) {
    fetchTestData();
    worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
  }

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"50%"}
        footer={null}
        title="Automatic Hierarchy Creation"
      >
        <span
          style={{ color: "#4b5563", opacity: 0.6, marginBottom: "0.25rem" }}
        >
          Aggregation operations should be configured manually
        </span>
        <div
          style={{
            height: "100%",
            margin: "0.5rem 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: "0.5rem 0" }}>
            <label htmlFor="process-select">Creation method:</label>
            <select
              onChange={(event) => setProcess(event.target.value)}
              name="process-select"
              style={{ textAlign: "center" }}
            >
              {/* <option value="">-</option> */}
              <option value="npl-cluster">Text based</option>
              {/*               <option value="taxonomy-process">Theme taxonomy</option> */}
            </select>
            {attributes.length === 0 && (
              <span style={{ color: "#dc2626", marginLeft: "0.75rem" }}>
                There are not{" "}
                <strong style={{ color: "#dc2626" }}>Attributes</strong>{" "}
                charged.{" "}
              </span>
            )}
          </div>
          {attributes.length > 0 &&
            process === "npl-cluster" &&
            isModalOpen && (
              <ClusteringProcess
                close={handleCancel}
                attributes={attributes}
                setProgress={setProgress}
                worker={worker}
                isModalOpen={!isModalOpen}
              />
            )}
        </div>
        <div
          style={{
            height: "6.5rem",
            minHeight: "5rem",
            borderTop: "2px solid #9ca3af",
            marginTop: "0.5rem",
            display: "flex",
            flexShrink: 0,
            paddingTop: "0.5rem",
            overflow: "hidden",
          }}
        >
          {progress.map((p) => {
            return (
              <Progress key={p.file} text={p.file} percentage={p.progress} />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default AutoHierModal;
