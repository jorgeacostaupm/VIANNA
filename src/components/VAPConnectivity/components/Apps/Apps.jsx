import Layout from 'antd/es/layout/layout';
import ButtonLink from '../ButtonLink/ButtonLink';
import { Col, Row } from 'antd';
import matrix from '@/assets/vis/images/matrix.png';
import circular from '@/assets/vis/images/circular.png';
import list from '@/assets/vis/images/list.png';
import atlas from '@/assets/vis/images/atlas.png';
import { setInit as setInitMatrix } from '@/components/VAPUtils/features/matrix/matrixSlice';
import { setInit as setInitCircular } from '@/components/VAPUtils/features/circular/circularSlice';
import { setInit as setInitAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { setInit as setInitList } from '@/components/VAPUtils/features/list/listSlice';

const Apps = () => {
  return (
    <>
      <Layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '80vh',
          background: 'white',
          overflow: 'hidden'
        }}
      >
        <Row
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}
        >
          <Col
            span={12}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              height: '100%'
            }}
          >
            <div style={{ aspectRatio: 1, height: '35%' }}>
              <img
                src={matrix}
                alt="Matrix Visualization"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <ButtonLink to="matrix" setInit={setInitMatrix}>
              Matrix
            </ButtonLink>

            <div style={{ aspectRatio: 1, height: '35%' }}>
              <img
                src={list}
                alt="List Visualization"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <ButtonLink to="list" setInit={setInitList}>
              List
            </ButtonLink>
          </Col>

          <Col
            span={12}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              height: '100%'
            }}
          >
            <div style={{ aspectRatio: 1, height: '35%' }}>
              <img
                src={circular}
                alt="Circular Visualization"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <ButtonLink to="circular" setInit={setInitCircular}>
              Circular
            </ButtonLink>

            <div style={{ aspectRatio: 1, height: '35%' }}>
              <img
                src={atlas}
                alt="Atlas Visualization"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <ButtonLink to="atlas" setInit={setInitAtlas}>
              Atlas
            </ButtonLink>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default Apps;
