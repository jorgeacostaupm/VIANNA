import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Atlas } from './Atlas';
import { updateAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { useApiServiceInfo } from '@/context/apiservice-context';
import useResizeObserver from '@/components/VAPCANTAB/Utils/hooks/useResizeObserver';
import { Spin } from 'antd';

export const AtlasEditorContainer = () => {
  const atlasRef = useRef(null);
  const divRef = useRef(null);
  const dispatch = useDispatch();
  const [instance, setInstance] = useState(null);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);
  const hovered_roi = useSelector((state) => state.atlas.hovered_roi);
  const atlas_3d = useSelector((state) => state.atlas.atlas_3d);
  const atlas = useSelector((state) => state.atlas.selected_atlas);
  const loading = useSelector((state) => state.atlas.loading_3d);
  const order = useSelector((state) => state.main.matrix_order);
  const context = useApiServiceInfo();

  const atlases = useSelector((state) => state.atlas.atlases);
  useEffect(() => {
    if ((!atlas_3d || !atlas) && atlases?.length > 0) {
      const atlas = atlases[0];
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
        }
      };
      dispatch(updateAtlas({ atlas, options }));
    }
  }, [atlases, atlas_3d, atlas]);

  const dimensions = useResizeObserver(divRef);
  useEffect(() => {
    instance && instance.onResize();
  }, [dimensions]);

  useEffect(() => {
    if (atlas_3d) {
      atlasRef.current.innerHTML = '';
      const atlas = new Atlas(atlasRef.current, 'atlas-editor', atlas_3d);
      setInstance(atlas);
    }
  }, [atlas_3d, order]);

  useEffect(() => {
    if (hovered_roi && instance) {
      instance.showRoisById([hovered_roi]);
    } else if (instance) {
      instance.showRoisById(selected_ids);
    }
  }, [hovered_roi, selected_ids]);

  useEffect(() => {
    if (instance) instance.showRoisById(selected_ids);
  }, [selected_ids]);

  return (
    <>
      <div ref={divRef} className="fillSpace">
        {loading ? (
          <Spin
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            className="fillSpace"
            size="large"
          ></Spin>
        ) : (
          <div className="fillSpace" ref={atlasRef}></div>
        )}
      </div>
    </>
  );
};
