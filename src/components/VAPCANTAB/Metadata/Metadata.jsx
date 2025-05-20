import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Descriptions } from 'antd';
import { Histogram } from './Histogram';
import NoData from '@/components/VAPConnectivity/components/NoData';
import useResizeObserver from '../useResizeObserver';

const Container = ({ data }) => {
  const svgRef = useRef(null);
  const dimensions = useResizeObserver(svgRef);

  useEffect(() => {
    svgRef.current.innerHTML = '';
    const histogram = new Histogram(svgRef.current, data);
    return () => {};
  }, [data, dimensions]);

  return (
    <>
      <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'visible' }}>
        <div id="tooltip"></div>
        <svg ref={svgRef} className="mySVG" preserveAspectRatio="xMidYMid meet" />
      </div>
    </>
  );
};

const PopulationInfo = ({ population, i }) => {
  useEffect(() => {}, []);

  const items = [
    {
      key: '0',
      label: 'Name',
      children: population.name,
      span: 1
    },
    {
      key: '1',
      label: 'Age',
      children: population.age.mean + ' ± ' + population.age.std,
      span: 1
    },
    {
      key: '2',
      label: 'Nº Records',
      children: population.n_records,
      span: 1
    }
  ];

  population.histograms.forEach((histogram) => {
    const item = {
      key: histogram.name,
      label: histogram.name === '__time' ? 'Visits' : formatString(histogram.name),
      labelStyle: { overflow: 'visible' },
      children: <Container key={histogram.name} data={histogram.data} />,
      span: histogram.name === 'sex_id' ? 2 : 5
    };
    items.push(item);
  });

  return (
    <Descriptions
      style={{ overflow: 'visible' }}
      column={5}
      title={'Population ' + i}
      bordered
      items={items}
    />
  );
};

const Metadata = () => {
  const populations = useSelector((state) => state.cantab.pop_metadata);

  return (
    <div className="componentLayout">
      {populations?.length > 0 ? (
        populations.map((population, i) => <PopulationInfo key={i} i={i} population={population} />)
      ) : (
        <NoData></NoData>
      )}
    </div>
  );
};

export default Metadata;

function formatString(string) {
  // Reemplaza todos los guiones bajos por espacios
  const stringWithoutUnderscores = string.replace(/_/g, ' ').replace(/id/g, ' ');

  // Capitaliza la primera letra
  return stringWithoutUnderscores.charAt(0).toUpperCase() + stringWithoutUnderscores.slice(1);
}
