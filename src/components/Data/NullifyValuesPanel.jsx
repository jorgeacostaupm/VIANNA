import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Input, Modal, Space, Tag, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import ColoredButton from "@/components/ui/ColoredButton";
import { replaceValuesWithNull } from "@/store/async/dataAsyncReducers";
import { notifyError, notifyInfo, notifySuccess } from "@/utils/notifications";

const { Text } = Typography;

export default function NullifyValuesPanel() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nullifiedValues = useSelector(
    (state) => state.dataframe.present.nullifiedValues,
  );
  const dataframe = useSelector((state) => state.dataframe.present.dataframe) || [];
  const quarantineData =
    useSelector((state) => state.cantab.present.quarantineData) || [];

  const trimmedValue = inputValue.trim();
  const matchesCount = useMemo(() => {
    if (!trimmedValue) return 0;

    const countMatches = (rows) =>
      rows.reduce((acc, row) => {
        if (!row || typeof row !== "object") return acc;
        const rowMatches = Object.values(row).filter(
          (value) => value == trimmedValue,
        ).length;
        return acc + rowMatches;
      }, 0);

    return countMatches(dataframe) + countMatches(quarantineData);
  }, [dataframe, quarantineData, trimmedValue]);

  const confirmNullify = () => {
    Modal.confirm({
      title: `Replace "${trimmedValue}" with null?`,
      content: `This will replace ${matchesCount} matching value(s) in data and quarantine.`,
      okText: "Replace values",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsSubmitting(true);
        try {
          await dispatch(replaceValuesWithNull(trimmedValue)).unwrap();
          notifySuccess({
            message: "Values replaced with null",
            description: `${matchesCount} value(s) were replaced.`,
          });
          setInputValue("");
        } catch (error) {
          notifyError({
            message: "Could not nullify values",
            error,
            fallback: "Failed to replace selected values with null.",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const onReplaceValues = () => {
    if (!trimmedValue) return;
    if (matchesCount === 0) {
      notifyInfo({
        message: "No matching values",
        description: `No values equal to "${trimmedValue}" were found.`,
      });
      return;
    }

    confirmNullify();
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ display: "flex", width: "100%", gap: 8 }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value to nullify"
          style={{ flex: 1 }}
        />
        <ColoredButton
          title={`Replace ${inputValue} with null`}
          shape="default"
          icon={<EditOutlined />}
          onClick={onReplaceValues}
          placement="bottom"
          loading={isSubmitting}
          disabled={isSubmitting || trimmedValue.length === 0}
        />
      </div>
      <Text type="secondary">
        Preview matches in data and quarantine: {matchesCount}
      </Text>

      <Card
        size="small"
        title="Nullified Values"
        style={{ marginTop: 12, borderRadius: 8 }}
      >
        <Space wrap>
          {nullifiedValues.map((val, idx) => (
            <Tag key={`${val}-${idx}`} color="red">
              {val}
            </Tag>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
