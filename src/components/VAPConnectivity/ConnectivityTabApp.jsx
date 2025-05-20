import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tabs } from 'antd';
import { notification } from 'antd';
import {
  BarChartOutlined,
  ApartmentOutlined,
  TableOutlined,
  DotChartOutlined,
  AppstoreAddOutlined,
  CopyOutlined,
  ProfileOutlined,
  EditOutlined,
  FilterOutlined
} from '@ant-design/icons';
import {
  subscribeToNotification,
  unsubscribeFromNotification
} from '@/components/VAPUtils/functions';
import { useApiServiceInfo } from '@/context/apiservice-context';

import { AtlasEditorTab } from './components/AtlasEditor/AtlasEditor';
import Apps from './components/Apps/Apps';
import GeneralInfo from './components/GeneralInfo/GeneralInfo';
import TestData from './components/TestData/TestData';
import LogicalFilter from './components/LogicalFilter/LogicalFilter';
import { setAtlases } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { setBoolMatrix, setFilteringExpr, setIsAllowed } from '@/components/VAPUtils/features/main/mainSlice';

const tabItems = [
  {
    key: 0,
    label: 'Test Data',
    children: <TestData />,
    closable: false,
    icon: <CopyOutlined />
  },
  {
    key: 1,
    label: 'Apps',
    children: <Apps />,
    closable: false,
    icon: <AppstoreAddOutlined />
  },

  {
    key: 2,
    label: 'Metadata',
    children: <GeneralInfo />,
    closable: false,
    icon: <ProfileOutlined />
  },
  {
    key: 3,
    label: 'Atlas Editor',
    children: <AtlasEditorTab />,
    closable: false,
    icon: <EditOutlined />
  },
  {
    key: 4,
    label: 'Global Filtering',
    children: (
      <LogicalFilter
        setBoolMatrix={setBoolMatrix}
        setFilteringExpr={setFilteringExpr}
        slice={'main'}
      />
    ),
    closable: false,
    icon: <FilterOutlined />
  }
];

const ConnectivityTabApp = () => {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const scenarioRunId = useSelector((state) => state.main.scenarioRunId);
  const context = useApiServiceInfo();

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.padding = '0px 0px';
      rootElement.style.maxWidth = '100vw';
    }

    return () => {
      if (rootElement) {
        rootElement.style.padding = '2rem';
        rootElement.style.maxWidth = '1280px';
      }
    };
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    subscribeToNotification(api);
    return () => {
      unsubscribeFromNotification();
    };
  }, [api]);

  // Fetch data when scenarioRunId changes
  useEffect(() => {
    if (scenarioRunId) {
    }
  }, [scenarioRunId, dispatch]);

  const fetchAvailableAtlases = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };

    try {
      const res = await fetch(`/server/api/vis/atlases/`, options);
      if (!res.ok) throw new Error('Error fetching available atlases');
      const atlases = await res.json();
      console.log('REQUESTED ATLASES: ', atlases);
      dispatch(setAtlases(atlases));
    } catch (error) {
      console.error('Error fetching atlases:', error);
    }
  };

  useEffect(() => {
    fetchAvailableAtlases();
    dispatch(setIsAllowed(true));
    return () => {
      dispatch(setIsAllowed(false));
    };
  }, []);

  return (
    <>
      {contextHolder}
      <Tabs
        hideAdd
        destroyInactiveTabPane
        type="editable-card"
        defaultActiveKey={0}
        items={tabItems}
        style={{ width: '100%' }}
      />
    </>
  );
};

export default ConnectivityTabApp;
