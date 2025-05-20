import Layout from 'antd/es/layout/layout';
import { message, Spin } from 'antd';
import ButtonLink from '../ButtonLink/ButtonLink';
import DataSelector from '../DataSelector/DataSelector';
import GetTestData from '../GetTestData';
import { GetElectrodesTestData } from '../GetTestData/GetTestData';
import AtlasEditor from '../AtlasEditor';
import { setAtlases, setAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GeneralInfoModal from '../GeneralInfoModal';
import LogicalFilterModal from '../LogicalFilterModal';
import { setIsAllowed, setLoading } from '@/components/VAPUtils/features/main/mainSlice';
import { setBoolMatrix, setFilteringExpr } from '@/components/VAPUtils/features/main/mainSlice';
import { useApiServiceInfo } from '@/context/apiservice-context';

const ConnectivityApp = () => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const loading = useSelector((state) => state.main.loading);
  const context = useApiServiceInfo();
  console.log('RENDERING CONNECTIVITY APP...');

  useEffect(() => {
    fetchScenario3DElectrodes();
    return () => {};
  }, []);

  const fetchScenario3DElectrodes = async (id) => {
    try {
      const res = await fetch(`/vis/base_atlases/electrodes_3D.json`);
      if (!res.ok) throw new Error(`Error fetching scenario run data: ${res.statusText}`);
      const tmp = await res.json();
      console.log('RETRIEVED ATLAS:', tmp);
      dispatch(setAtlas(tmp));
    } catch (error) {
      console.error('Error fetching scenario run data:', error);
    }
  };

  // Retrieve scenarioRunId from Redux store
  const scenarioRunId = useSelector((state) => state.main.scenarioRunId);
  console.log('Received scenarioRunId:', scenarioRunId);
  //////////////////////////////////////

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
      messageApi.success('Configuration retrieved!');
    } catch (error) {
      console.error('Error fetching atlases:', error);
      messageApi.error('Server configuration not retrieved, Apps will work with minimal setup!');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    console.log('REQUESTING INITIAL CONFIGURATION...');
    fetchAvailableAtlases();
    dispatch(setIsAllowed(true));
    return () => {
      dispatch(setIsAllowed(false));
    };
  }, []);

  const contentStyle = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4
  };
  const content = <div style={contentStyle} />;

  return (
    <>
      <Layout
        style={{
          width: '100%',
          height: '80vh',
          marginTop: '1px',
          marginBottom: '1px'
        }}
      >
        {contextHolder}
        <Layout
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            gap: '50px',
            overflow: 'hidden',
            background: 'white'
          }}
        >
          {loading ? (
            <Spin tip="Loading..." size="large">
              {content}
            </Spin>
          ) : (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                gap: '1vh',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {' '}
                Get data:
                <GetTestData num_populations={1} />
                <GetTestData num_populations={2} />
                <GetElectrodesTestData num_populations={1} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {' '}
                Modals:
                <DataSelector />
                <GeneralInfoModal />
                <AtlasEditor />
                <LogicalFilterModal
                  title="Global Logical Filter"
                  setBoolMatrix={setBoolMatrix}
                  setFilteringExpr={setFilteringExpr}
                  width={'80%'}
                  slice={'main'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {' '}
                Tabs Apps:
                <ButtonLink to="matrix">Matrix</ButtonLink>
                <ButtonLink to="circular">Circular</ButtonLink>
                <ButtonLink to="list">List</ButtonLink>
                <ButtonLink to="atlas">Atlas</ButtonLink>
              </div>
            </div>
          )}
        </Layout>
      </Layout>
    </>
  );
};

export default ConnectivityApp;
