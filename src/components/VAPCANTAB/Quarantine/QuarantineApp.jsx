import React from 'react';
import { useSelector } from 'react-redux';
import NoData from '@/components/VAPConnectivity/components/NoData';
import Quarantine from './Quarantine';
import QuarantineButtons from './QuarantineButtons';

const QuarantineApp = () => {
  const dt = useSelector((state) => state.cantab.quarantineData);

  return (
    <>
      <QuarantineButtons></QuarantineButtons>
      {dt?.length > 0 && (
        <div className="overviewLayout">
          <Quarantine></Quarantine>
        </div>
      )}
      {dt?.length === 0 && (
        <div className="centerOverviewLayout">
          <NoData />
        </div>
      )}
    </>
  );
  1;
};

export default QuarantineApp;
