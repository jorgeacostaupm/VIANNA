import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import '../configuration/styles.css';
import axios from 'axios';
import Tables from './Tables';
import VisitsRadio from './VisitsRadio';
import BandsSelector from './BandsSelector';
import AtlasSelector from './AtlasSelector';
import store from '@/components/VAPUtils/features/store';
import { useSelector } from 'react-redux';
import MeasuresSelector from './MeasuresSelector';
import StatisticsSelector from './StatiticsSelector';
import ViewsManager from '../../../managers/ViewsManager';

const manager = ViewsManager.getInstance();

const DataMenu = () => {
  const populations = useSelector((state) => state.selection.populations);
  const [common_visits, setVisits] = useState([]);
  const [common_measures, setMeasures] = useState([]);
  const [common_bands, setBands] = useState([]);
  const [common_atlases, setAtlases] = useState([]);
  const [updated_populations, setUpdatedPopulations] = useState([]);

  useEffect(() => {
    if (populations.length > 0) {
      const updated = [...populations];
      if (updated.length === 1) {
        updated.push(updated[0]);
      }
      const pop1 = updated[0];
      const pop2 = updated[1];
      const { common_visits, common_measures, common_bands, common_atlases } = findCommonItems(
        pop1,
        pop2
      );
      setVisits(common_visits);
      setMeasures(common_measures);
      setBands(common_bands);
      setAtlases(common_atlases);
      setUpdatedPopulations(updated);
    } else {
      setUpdatedPopulations([]);
    }
    return () => {};
  }, [populations]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}
    >
      <div style={{ height: '58%', overflow: 'scroll' }}>
        <Tables />
      </div>

      {populations.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '32%',
            width: '100%',
            rowGap: '5px',
            marginTop: '20px'
          }}
        >
          <AtlasSelector common_atlases={common_atlases} />
          <div style={{ display: 'flex', flexDirection: 'row', columnGap: '30px' }}>
            {updated_populations.map((population, i) => (
              <VisitsRadio
                key={i}
                i={i}
                population={population.name}
                common_visits={common_visits}
              />
            ))}
          </div>
          <MeasuresSelector common_measures={common_measures} />

          <BandsSelector common_bands={common_bands} />

          <StatisticsSelector />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Button type="primary" onClick={onRequestData}>
              Get Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataMenu;

function requestReady(request) {
  return true;
}

function onRequestData() {
  const selection = store.getState().selection;
  const request = {};
  request.populations = selection.populations;
  const atlas = store.getState().atlas.atlases.find((atlas) => atlas.name === selection.atlas);

  request.atlas = atlas.base;
  request.visits = selection.visits;
  request.measures = selection.measures;
  request.bands = selection.bands;
  request.statistics = selection.statistics;

  console.log('Request: ', request);
  if (!requestReady(request)) {
    // TODO
    alert('There are missing fileds!');
  } else {
    axios.post(`/server/api/vis/connectivity/`, request).then(
      (response) => {
        const data = response.data;
        console.log('REQUESTED DATA: ', data);
        manager.setData(data);
      },
      (error) => {
        console.log(error);
        return [];
      }
    );
  }
}

function findCommonItems(obj1, obj2) {
  // Helper function to find the intersection of two arrays
  const intersect = (arr1, arr2) => arr1.filter((value) => arr2.includes(value));

  const common_visits = intersect(obj1.visits, obj2.visits);
  const common_measures = intersect(obj1.measures, obj2.measures);
  const common_bands = intersect(obj1.bands, obj2.bands);
  const common_atlases = intersect(obj1.atlases, obj2.atlases);

  return {
    common_visits,
    common_measures,
    common_bands,
    common_atlases
  };
}
