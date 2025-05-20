import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Descriptions } from 'antd';
import { Histogram } from './Histogram';
import NoData from '@/components/VAPConnectivity/components/NoData';

const Container = ({ data }) => {
  const divRef = useRef(null);

  useEffect(() => {
    divRef.current.innerHTML = '';
    const histogram = new Histogram(divRef.current, data);
    return () => {};
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        style={{ position: 'relative' }}
        ref={divRef}
        width="100%"
        height="100%"
        overflow={'visible'}
        fill="red"
      />
    </div>
  );
};

const PopulationInfo = ({ population }) => {
  useEffect(() => {}, []);

  const items = [
    {
      key: '1',
      label: 'Name',
      children: population.name
    },
    {
      key: '2',
      label: 'Creator',
      children: population.creator
    },
    {
      key: '3',
      label: 'From Set',
      children: population.set_id
    },
    {
      key: '4',
      label: 'Age',
      children: population.age.mean + ' ± ' + population.age.std
    },
    {
      key: '5',
      label: 'Updated',
      children: population.updated
    },

    {
      key: '6',
      label: 'Group description',
      children: population.group_description,
      span: 5
    }
  ];

  population.histograms.forEach((histogram) => {
    const item = {
      key: histogram.name,
      label: histogram.name,
      children: <Container key={histogram.name} data={histogram.data} />,
      span: 5
    };
    items.push(item);
  });

  return <Descriptions column={5} title={population.type + ' Population'} bordered items={items} />;
};

const PopulationsInfo = () => {
  const populations = useSelector((state) => state.main.populations);

  useEffect(() => {}, []);

  return (
    <div className="infoDiv">
      {populations?.length > 0 ? (
        populations.map((population, i) => <PopulationInfo key={i} population={population} />)
      ) : (
        <NoData></NoData>
      )}
    </div>
  );
};

export default PopulationsInfo;
