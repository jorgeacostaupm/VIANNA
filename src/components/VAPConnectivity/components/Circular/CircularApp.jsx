import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Menu from './Menu';
import Container from './Container';
import ViewsManager from '../../managers/ViewsManager';
import { setInit } from '@/components/VAPUtils/features/circular/circularSlice';
import NoData from '../NoData';

const manager = ViewsManager.getInstance();

export const CircularApp = ({ title, combined }) => {
  const attr = useSelector((state) => state.circular.vis_attr);
  const types = useSelector((state) => state.main.types);
  const base = useSelector((state) => state.main.base);
  const atlas = useSelector((state) => state.atlas.selected_atlas);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('CIRCULAR APP INITIALIZED');
    dispatch(setInit(true));

    if (title) {
      document.title = title;
    }

    const handleBeforeUnload = (event) => {
      dispatch(setInit(false));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      dispatch(setInit(false));
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch]);

  useEffect(() => {
    if (types?.length > 0) {
      manager.initCircular();
    }
  }, [types]);

  return (
    <>
      <div className="containerDiv">
        {attr?.type && base == atlas?.base && atlas ? (
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

export default CircularApp;
