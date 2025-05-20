import React, { useEffect, useCallback } from 'react';
import { Tabs, Layout } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import ViewLinks from './ViewLinks';
import AttributeList from './AttributeList';
import ListAttributeSelector from './ListAttributeSelector';
import {
  setLinks as setMatrixLinks,
  addLinks as addMatrixLinks
} from '@/components/VAPUtils/features/matrix/matrixSlice';
import {
  setLinks as setCircularLinks,
  addLinks as addCircularLinks
} from '@/components/VAPUtils/features/circular/circularSlice';
import {
  setLinks,
  addLinks,
  addLinkAttr,
  removeLinkAttr,
  setInit
} from '@/components/VAPUtils/features/list/listSlice';

import { TableOutlined, HarmonyOSOutlined, BarsOutlined } from '@ant-design/icons';

const tabs_items = [
  {
    label: 'Matrix Links',
    key: '1',
    closable: false,
    icon: <TableOutlined />,
    children: (
      <ViewLinks
        setters={[
          { app: 'Links', setLinks: setLinks, addLinks: addLinks },
          {
            app: 'Circular',
            setLinks: setCircularLinks,
            addLinks: addCircularLinks
          }
        ]}
        slice="matrix"
        setLinks={setMatrixLinks}
      />
    )
  },
  {
    label: 'Circular Links',
    key: '2',
    closable: false,
    icon: <HarmonyOSOutlined />,
    children: (
      <ViewLinks
        setters={[
          { app: 'Links', setLinks: setLinks, addLinks: addLinks },
          { app: 'Matrix', setLinks: setMatrixLinks, addLinks: addMatrixLinks }
        ]}
        slice="circular"
        setLinks={setCircularLinks}
      />
    )
  },
  {
    label: 'Links',
    key: '4',
    closable: false,
    icon: <BarsOutlined />,
    children: (
      <ViewLinks
        setters={[
          { app: 'Matrix', setLinks: setMatrixLinks, addLinks: addMatrixLinks },
          {
            app: 'Circular',
            setLinks: setCircularLinks,
            addLinks: addCircularLinks
          }
        ]}
        slice="list"
        setLinks={setLinks}
      />
    )
  }
];

const LinksApp = ({ title }) => {
  const dispatch = useDispatch();
  const linkAttrs = useSelector((state) => state.list.link_attrs);

  const handleBeforeUnload = useCallback(
    (event) => {
      dispatch(setInit(false));
    },
    [dispatch]
  );

  useEffect(() => {
    console.log('LIST APP INITIALIZED');
    dispatch(setInit(true));

    if (title) {
      document.title = title;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      dispatch(setInit(false));
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  return (
    <Layout style={styles.layout}>
      <div style={styles.tabContainer}>
        <Tabs
          type="editable-card"
          destroyInactiveTabPane
          hideAdd
          style={styles.tabs}
          items={tabs_items}
        />
      </div>

      <div style={styles.bottomContainer}>
        <div style={styles.attributeSelectorContainer}>
          <ListAttributeSelector attrs={linkAttrs} addAttr={addLinkAttr} />

          <div style={{ height: '80%' }}>
            <div>Selected Attributes: </div>
            <div style={styles.attributeListContainer}>
              <AttributeList attrs={linkAttrs} removeAttr={removeLinkAttr} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  layout: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden'
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '80%'
  },
  tabs: {
    flex: 1,
    /* border: "2px solid black", */
    borderRadius: '5px',
    overflow: 'hidden'
  },
  bottomContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    left: 0,
    height: '22%',
    gap: '20px',
    justifyContent: 'space-evenly',
    background: 'white'
  },
  attributeSelectorContainer: {
    padding: '5px',
    marginTop: '10px',
    width: '100%',
    borderRadius: '5px'
  },
  attributeListContainer: {
    padding: '5px',
    borderRadius: '5px',
    height: '70%',
    rowGap: '5px',
    columnGap: '5px',
    background: 'white',
    marginTop: '5px',
    border: '1px solid grey'
  }
};

export default LinksApp;
