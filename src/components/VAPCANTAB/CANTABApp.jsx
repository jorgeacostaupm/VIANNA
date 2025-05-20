import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs } from "antd";
import { notification } from "antd";
import {
  updateFromImport,
  updateFromJSON,
} from "@/components/VAPUtils/features/data/dataSlice";
import { setFullMeta } from "@/components/VAPUtils/features/metadata/metaSlice";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { tabItems } from "@/components/VAPCANTAB/Utils/constants/cantabAppConstants";
import {
  useRootStyle,
  useNotificationSubscription,
} from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import * as api from "@/components/VAPCANTAB/Utils/services/cantabAppServices";
const { publish } = pubsub;

const CANTABApp = () => {
  const dispatch = useDispatch();
  const [apiNotif, contextHolder] = notification.useNotification();
  const dt = useSelector((state) => state.dataframe.dataframe);

  useRootStyle();
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    console.log("use eefeecteddd");
    if (!dt) loadTestData(dispatch);
  }, []);

  return (
    <>
      {contextHolder}
      <Tabs
        hideAdd
        type="editable-card"
        items={tabItems}
        defaultActiveKey={1}
      />
    </>
  );
};

export default CANTABApp;

async function loadTestData(dispatch) {
  console.log("FETCHING TEST DATA...");
  try {
    const hierarchy = await api.fetchTestHierarchy();
    dispatch(setFullMeta(hierarchy));
    const data = await api.fetchTestData();
    dispatch(updateFromImport({ data, isGenerateHierarchy: false }));
  } catch (error) {
    handleError(error, "Error loading test data");
  }
}

function handleError(error, message) {
  console.error(message, error);
  publish("notification", {
    message,
    description: error.message,
    type: "error",
  });
}
