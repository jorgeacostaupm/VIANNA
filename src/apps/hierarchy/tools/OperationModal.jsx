import { Modal, Select, InputNumber } from "antd";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SPECIAL_FUNCTIONS } from "../menu/logic/formulaConstants";
import { applyOperation } from "@/store/async/metaAsyncReducers";
import { getCategoricalKeys } from "@/utils/functions";

const { Option } = Select;

export default function OperationModal({
  open,
  setOpen,
  node,
  selectedNodes,
  setActive,
}) {
  const dispatch = useDispatch();

  const [operation, setOperation] = useState(null);
  const [params, setParams] = useState({});

  const data = useSelector((state) => state.dataframe.present.selection || []);
  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOperation(null);
      setParams({});
    }
  }, [open]);

  const onOperationChange = (op) => {
    setOperation(op);

    // Reset params al cambiar de operación
    if (op === "zscoreByGroup") {
      setParams({ group: [] });
    } else if (op === "zscoreByValues") {
      const newParams = {};
      selectedNodes.forEach((n) => {
        newParams[n.id] = { mean: null, stdev: null };
      });
      setParams(newParams);
    } else {
      setParams({});
    }
  };

  const updateNodeParam = (nodeId, key, value) => {
    setParams((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        [key]: value,
      },
    }));
  };

  const isConfirmDisabled = () => {
    if (!operation) return true;

    if (operation === "zscoreByGroup") {
      return !params.group || params.group.length === 0;
    }

    if (operation === "zscoreByValues") {
      return selectedNodes.some((n) => {
        const v = params[n.id];
        return !v || v.mean == null || v.stdev == null;
      });
    }

    return false;
  };

  const onConfirm = () => {
    dispatch(
      applyOperation({
        operation,
        params,
        node,
        selectedNodes,
      })
    );

    setOpen(false);
    setActive(false);
  };

  if (!node?.parent) return null;

  return (
    <Modal
      title="Apply Operation"
      open={open}
      onOk={onConfirm}
      onCancel={() => setOpen(false)}
      okButtonProps={{ disabled: isConfirmDisabled() }}
      destroyOnClose
    >
      {/* ---------------- Operation selector ---------------- */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>Operation</div>
        <Select
          style={{ width: "100%" }}
          placeholder="Select operation"
          value={operation}
          onChange={onOperationChange}
          options={Object.keys(SPECIAL_FUNCTIONS).map((func) => ({
            label: func,
            value: func,
          }))}
        />
      </div>

      {/* ---- zscoreByValues ---- */}
      {operation === "zscoreByValues" &&
        selectedNodes.map((n) => (
          <div
            key={n.id}
            style={{
              padding: 12,
              marginBottom: 12,
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              {n.data?.name || n.name}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <InputNumber
                style={{ flex: 1 }}
                placeholder="Mean"
                value={params[n.id]?.mean}
                onChange={(v) => updateNodeParam(n.id, "mean", v)}
              />

              <InputNumber
                style={{ flex: 1 }}
                placeholder="Std Dev"
                min={0}
                value={params[n.id]?.stdev}
                onChange={(v) => updateNodeParam(n.id, "stdev", v)}
              />
            </div>
          </div>
        ))}

      {/* ---- zscoreByGroup ---- */}
      {operation === "zscoreByGroup" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>Group by</div>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select one or more groups"
            value={params.group}
            onChange={(group) => setParams((prev) => ({ ...prev, group }))}
          >
            {categoricalVars.map((key) => (
              <Option key={key} value={key}>
                {key}
              </Option>
            ))}
          </Select>
        </div>
      )}
    </Modal>
  );
}
