import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Space, Typography } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

import useRootStyles from "@/hooks/useRootStyles";
import useNotification from "@/hooks/useNotification";
import { APP_NAME } from "@/utils/Constants";
import SingleViewAppLayout from "@/components/ui/SingleViewAppLayout";
import styles from "@/styles/App.module.css";

import { setInit } from "@/store/slices/cantabSlice";
import { notifyError } from "@/utils/notifications";

import Explorer from "../explorer";
import loadTestData from "./loadTestData";
import AppsButtons from "./AppsButtons";
import MainSidebar from "./MainSidebar";

const { Text } = Typography;

export default function MainApp() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isChoiceDismissed, setIsChoiceDismissed] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  useRootStyles(setInit, APP_NAME);
  const holder = useNotification();

  const hasData = Array.isArray(dataframe) && dataframe.length > 0;
  const shouldShowInitialChoice = useMemo(
    () => !isChoiceDismissed && !hasData,
    [isChoiceDismissed, hasData],
  );

  const handleLoadDemo = async () => {
    setIsDataManagementOpen(false);
    setIsLoadingDemo(true);
    try {
      const loaded = await loadTestData(dispatch);
      if (loaded) {
        setIsChoiceDismissed(true);
      }
    } catch (error) {
      notifyError({
        message: "Could not load demo data",
        error,
      });
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleLoadMyData = () => {
    setIsChoiceDismissed(true);
    setIsDataManagementOpen(true);
  };

  const handleContinueWithoutData = () => {
    setIsChoiceDismissed(true);
    setIsDataManagementOpen(false);
  };

  return (
    <>
      {holder}
      <SingleViewAppLayout
        sidebar={
          shouldShowInitialChoice ? null : (
            <MainSidebar>
              <AppsButtons
                dataManagementOpen={isDataManagementOpen}
                onDataManagementOpenChange={setIsDataManagementOpen}
              />
            </MainSidebar>
          )
        }
        viewKey="explorer"
      >
        {shouldShowInitialChoice ? (
          <div className={styles.mainLoadDemoData}>
            <Card className={styles.initialDataChoiceCard}>
              <Space direction="vertical" size="middle">
                <Text strong>Select how you want to start</Text>
                <Text type="secondary">
                  Load demo files to explore the app, or upload your own data.
                </Text>
                <Space wrap>
                  <Button
                    type="primary"
                    onClick={handleLoadDemo}
                    loading={isLoadingDemo}
                  >
                    Load Demo Data
                  </Button>
                  <Button
                    type="default"
                    icon={<DatabaseOutlined />}
                    onClick={handleLoadMyData}
                  >
                    Load My Data
                  </Button>
                </Space>
                <Button
                  type="text"
                  icon={<DatabaseOutlined />}
                  onClick={handleContinueWithoutData}
                >
                  Continue without data
                </Button>
              </Space>
            </Card>
          </div>
        ) : null}
        {shouldShowInitialChoice ? null : <Explorer />}
      </SingleViewAppLayout>
    </>
  );
}
