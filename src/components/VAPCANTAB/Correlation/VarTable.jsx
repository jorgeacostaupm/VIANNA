import { Table } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setColumns } from '@/components/VAPUtils/features/correlation/correlationSlice';

const columns = [
  {
    title: 'Measure',
    dataIndex: 'attr',
    render: (text, d) => {
      return <div title={d.info}> {d.attr} </div>;
    }
  }
];

const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const VarTable = () => {
  const attrs = useSelector((state) => state.metadata.attributes);
  const data = useSelector((state) => state.dataframe.navioColumns).map((d, i) => {
    const attr = attrs.find((a) => a.name === d);
    return {
      key: d,
      attr: d,
      choosen: false,
      info: attr ? attr.desc : 'Description not available...'
    };
  });

  const selectedRowKeys = useSelector((state) => state.correlation.columns);
  const dispatch = useDispatch();

  const rowSelection = {
    selectedRowKeys,
    hideSelectAll: false,
    selections: false,
    onChange: (selectedRowKeys, selectedRows) => {
      const selection = selectedRows.map((d) => d.attr);
      dispatch(setColumns(selection));
    }
  };

  return (
    <div style={{ height: '100%', width: '20%' }}>
      <div className="correlationVariables">
        <Table
          columns={columns}
          dataSource={data}
          bordered={true}
          pagination={false}
          rowSelection={rowSelection}
          scroll={{
            y: 'max-content'
          }}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default VarTable;
