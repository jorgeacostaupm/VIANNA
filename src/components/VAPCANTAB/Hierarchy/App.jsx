import { useState, useEffect } from 'react';
import Header from './components/Header';
import SideBar from './components/SideBar';
import DataLoadPanel from './components/data-load/DataLoadPanel';
import EditorComponent from './editor/EditorComponent';
import NavioVisPanel from './components/vis-navio/NavioVisPanel';
import * as d3 from 'd3';
import { useDispatch, useSelector } from 'react-redux';

import { pubsub } from './pubsub';
import TableVisComponent from './components/data-table/TableVisComponent';

import { addFunction } from 'arquero';
import { parse } from 'date-fns';
import { extractMeta, updateFromAPI } from '@/components/VAPUtils/features/data/dataSlice';

const String = (x) => {
  if (x == null) {
    return '';
  } else {
    return x.toString();
  }
};

const tryParseDate = (date, format) => {
  try {
    return parse(date, format, new Date());
  } catch (err) {
    return null;
  }
};
const fromUnix = (date) => {
  try {
    return new Date(date * 1000);
  } catch (err) {
    return null;
  }
};

function App() {
  const [tab, setTab] = useState('hier-editor');
  const { subscribe } = pubsub;
  const dispatch = useDispatch();

  // Add new functions to Arquero
  addFunction('string', String, { override: true });
  addFunction('parseDate', tryParseDate, { override: true });
  addFunction('parseUnixDate', fromUnix, { override: true });

  subscribe('changePanelEvent', ({ tab }) => setTab(tab));

  useEffect(() => {
    console.log('sadasd');
    d3.csv('./test.csv').then(function (data) {
      console.log('los datos', data);
      dispatch(updateFromAPI(data));
    });
  }, []);

  return (
    <>
      <Header tab={tab}></Header>
      <SideBar tab={tab} setTab={setTab}></SideBar>
      {tab === 'data-load' && <DataLoadPanel />}
      {tab === 'data-table' && <TableVisComponent />}
      {tab === 'hier-editor' && <EditorComponent />}
      {tab === 'vis-navio' && <NavioVisPanel />}
    </>
  );
}

export default App;
