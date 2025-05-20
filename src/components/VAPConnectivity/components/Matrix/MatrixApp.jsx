import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Menu from './Menu';
import Container from './Container';
import ViewsManager from '../../managers/ViewsManager';
import NoData from '../NoData';
import { Spin } from 'antd';

const manager = ViewsManager.getInstance();

export const MatrixApp = ({ title, combined }) => {
  const attr = useSelector((state) => state.matrix.vis_attr);
  const types = useSelector((state) => state.main.types);
  const base = useSelector((state) => state.main.base);
  const atlas = useSelector((state) => state.atlas.selected_atlas);

  useEffect(() => {
    if (types?.length > 0) {
      manager.initMatrix();
    }
  }, [types]);

  const loading = useSelector((state) => state.main.loading);

  return (
    <>
      <div className="containerDiv">
        {loading ? (
          <Spin
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'white'
            }}
            className="appContainer"
            size="large"
          ></Spin>
        ) : attr?.type && base == atlas?.base && atlas ? (
          <>
            <div className="appContainer">{<Container attr={attr} />}</div>
            <Menu combined={combined} />
          </>
        ) : (
          <NoData></NoData>
        )}
      </div>
    </>
  );
};

export default MatrixApp;
