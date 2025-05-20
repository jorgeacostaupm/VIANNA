import { useSelector } from 'react-redux';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Container from '../Container';
import Menu from '.';
import DataManager from '../../../managers/DataManager';
import ViewsManager from '../../../managers/ViewsManager';
import { Spin } from 'antd';
import useRootStyles from '@/components/VAPUtils/useRootStyles';

const utils = DataManager.getInstance();
const manager = ViewsManager.getInstance();

export const MultiMatrix = () => {
  const multi_attrs = useSelector((state) => state.matrix.multi_attrs);
  const types = useSelector((state) => state.main.types);
  const targetRef = useRef(null);
  const atlas = useSelector((state) => state.atlas.atlas_3d);
  const loading = useSelector((state) => state.main.loading);

  useRootStyles({ padding: '0px 0px', maxWidth: '100vw' }, { padding: '2rem', maxWidth: '1280px' });

  const [calculatedWidth, setCalculatedWidth] = useState(
    `${100 / calculateRows(multi_attrs.length)}%`
  );
  const [calculatedHeight, setCalculatedHeight] = useState(
    `${100 / calculateColumns(multi_attrs.length)}%`
  );

  useEffect(() => {
    setCalculatedWidth(`${100 / calculateRows(multi_attrs.length)}%`);
    setCalculatedHeight(`${100 / calculateColumns(multi_attrs.length)}%`);
  }, [multi_attrs]);

  useEffect(() => {
    if (types?.length > 0) {
      manager.initMatrix();
    }
  }, [types]);

  const contentStyle = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4
  };
  const content = <div style={contentStyle} />;

  return (
    <>
      {atlas && !loading ? (
        <div style={{ display: 'flex', width: '100%' }}>
          <div
            style={{
              width: '200px',
              padding: '5px',
              flexShrink: 0
            }}
          >
            {<Menu modal={true} />}
          </div>

          <div
            style={{
              flexGrow: 1
            }}
          >
            <div
              ref={targetRef}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0px',
                height: '99vh',
                marginTop: '1vh',
                marginBottom: '1vh',
                boxShadow: '0 0 1px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              {multi_attrs.map((attr, index) => (
                <Container
                  calculatedHeight={calculatedHeight}
                  calculatedWidth={calculatedWidth}
                  key={utils.getAttrKey(attr)}
                  attr={attr}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh'
          }}
        >
          <Spin tip="Loading..." size="large">
            {content}
          </Spin>
        </div>
      )}
    </>
  );
};

function calculateRows(numBands) {
  if (numBands <= 3) {
    return 1;
  } else if (numBands === 4 || numBands === 5 || numBands === 6) {
    return 2;
  } else {
    // For 7 or more elements, return 3 columns
    return 3;
  }
}

function calculateColumns(numBands) {
  if (numBands === 1) {
    return 1;
  } else if (numBands === 2 || numBands === 4) {
    return 2;
  } else {
    return 3;
  }
}
