import Layout from 'antd/es/layout/layout';
import ButtonLink from '../ButtonLink/ButtonLink';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, Spin } from 'antd';
import GetTestData from '../GetTestData';
import { GetElectrodesTestData } from '../GetTestData/GetTestData';
import DataSelector from '../DataSelector/DataSelector';

const TestData = () => {
  const loading = useSelector((state) => state.main.loading);

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '80vh',
          overflow: 'hidden',
          background: 'white'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '20vw',
            height: '30vh'
          }}
        >
          {loading && (
            <Spin tip="Loading..." size="large">
              {content}
            </Spin>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <GetTestData num_populations={1} />
          <GetTestData num_populations={2} />
          <GetElectrodesTestData num_populations={1} />
          <DataSelector />
        </div>
      </Layout>
    </>
  );
};

export default TestData;
