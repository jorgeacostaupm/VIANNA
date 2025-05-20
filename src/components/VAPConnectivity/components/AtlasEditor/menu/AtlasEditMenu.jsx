import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useMemo } from 'react';
import { AtlasDescription } from './AtlasDescription';
import EditMenuELC127 from './EditMenuELC126';
import EditMenuAAL90 from './EditMenuAAL90';
import { placeholders } from '../configuration/config.json';
import { SaveAtlas, DeleteAtlas, ResetAtlas } from './EditAtlasButtons';

export const AtlasEditMenu = () => {
  const selected_atlas = useSelector((state) => state.atlas.selected_atlas);

  let menu;
  if (selected_atlas.base === 'aal-90') menu = <EditMenuAAL90 edit={true} />;
  else if (selected_atlas.base === 'elc-127') menu = <EditMenuELC127 />;

  return (
    <>
      {menu}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: '10px'
        }}
      >
        <ResetAtlas />
        <SaveAtlas />
        <DeleteAtlas />
      </div>
    </>
  );
};
