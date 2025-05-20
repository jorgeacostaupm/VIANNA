import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Atlas } from '../AtlasEditor/3d/Atlas';
import { AtlasMenu } from './AtlasMenu';
import { setLinks, setInit } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { updateAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import { useApiServiceInfo } from '@/context/apiservice-context';

export const AtlasApp = (props) => {
  const container_ref = useRef(null);
  const [instance, setInstance] = useState(null);
  const hovered_roi = useSelector((state) => state.atlas.hovered_roi);
  const selected_ids = useSelector((state) => state.atlas.selected_ids);
  const links = useSelector((state) => state.atlas.links);
  const dispatch = useDispatch();
  const context = useApiServiceInfo();

  const menu_ref = useRef(null);

  const atlas_3d = useSelector((state) => state.atlas.atlas_3d);
  const order = useSelector((state) => state.main.matrix_order);

  const atlases = useSelector((state) => state.atlas.atlases);
  useEffect(() => {
    if (atlas_3d == null && atlases?.length > 0) {
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
  }, []);

  useEffect(() => {
    if (atlas_3d) {
      container_ref.current.innerHTML = '';
      const atlas = new Atlas(container_ref.current, 'atlas-editor', atlas_3d);
      setInstance(atlas);
    }
  }, [atlas_3d, order]);

  useEffect(() => {
    console.log('ATLAS APP INITIALIZED');
    dispatch(setInit(true));

    if (props.title) {
      document.title = props.title;
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
    if (hovered_roi && instance) {
      instance.removeLinks();
      instance.showRoisById([hovered_roi]);
    } else if (links.length > 0) {
      instance.showLinksAndNodes(links);
    } else if (instance) {
      instance.removeLinks();
      instance.showRoisById(selected_ids);
    }
  }, [hovered_roi]);

  useEffect(() => {
    if (instance) {
      if (links.length > 0) instance.showLinksAndNodes(links);
      else instance.showRoisById(selected_ids);
    }
  }, [links, selected_ids]);

  useEffect(() => {
    const new_links = links.filter(
      (link) => selected_ids.includes(link.x_node) && selected_ids.includes(link.y_node)
    );
    dispatch(setLinks(new_links));
    return () => {};
  }, [selected_ids, dispatch]);

  return (
    <div className="containerDiv">
      <div className="appContainer" ref={container_ref}></div>
      <div ref={menu_ref} className="atlasMenuDiv">
        <AtlasMenu />
      </div>
    </div>
  );
};

export default AtlasApp;
