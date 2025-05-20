import React, { useCallback } from 'react';
import { Button } from 'antd';
import ViewsManager from '../../managers/ViewsManager';
import { setLoading } from '@/components/VAPUtils/features/main/mainSlice';
import { useDispatch } from 'react-redux';
import { updateData } from '@/components/VAPUtils/features/main/mainSlice';
import { useApiServiceInfo } from '@/context/apiservice-context';

const manager = ViewsManager.getInstance();

export const GetTestData = ({ num_populations }) => {
  const dispatch = useDispatch();
  const context = useApiServiceInfo();

  const fetchTestData = useCallback(async () => {
    dispatch(setLoading(true));
    console.log('REQUESTING TEST DATA...');
    const data = {};
    data.atlas = 'aal';
    data.populations = new Array(num_populations).fill(1);
    data.measures = ['ciplv', 'plv'];
    data.visits = num_populations === 1 ? [1] : [1, 2];
    data.bands = ['delta', 'theta', 'alpha_low', 'alpha_high', 'beta_low', 'beta_high', 'gamma'];
    data.statistics = ['max', 'min', 'mean'];
    const url = `/server/api/vis/connectivity/test_aal/`;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };
    dispatch(updateData({ data, url, options }));
  });

  return (
    <>
      <Button style={{ width: '100%' }} type="primary" onClick={fetchTestData}>
        Get Test Data! ({num_populations})
      </Button>
    </>
  );
};

export default GetTestData;

export const GetElectrodesTestData = ({ num_populations }) => {
  const dispatch = useDispatch();
  const context = useApiServiceInfo();

  const fetchTestData = useCallback(async () => {
    dispatch(setLoading(true));
    console.log('REQUESTING ELECTRODES TEST DATA...');
    const data = {};
    data.atlas = 'aal';
    data.populations = new Array(num_populations).fill(1);
    data.measures = ['ciplv', 'plv'];
    data.visits = num_populations === 1 ? [1] : [1, 2];
    data.bands = ['delta', 'theta', 'alpha_low', 'alpha_high', 'beta_low', 'beta_high', 'gamma'];
    data.statistics = ['max', 'min', 'mean'];
    const url = `/server/api/vis/connectivity/test_electrodes/`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context?.apiServiceInfo && { Authorization: `Token ${context.apiServiceInfo.token}` })
      }
    };

    dispatch(updateData({ data, url, options }));
  });

  return (
    <>
      <Button style={{ width: '100%' }} type="primary" onClick={fetchTestData}>
        Get Electrodes Test Data!
      </Button>
    </>
  );
};
