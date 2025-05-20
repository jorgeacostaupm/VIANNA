import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import store from '@/components/VAPUtils/features/store';
import { Input, Button, message, Tag } from 'antd';
import { generateBoolMatrix } from './logicalFiltering';

const expression = '  study-plv-delta 0.5 ';
const operators = ['and', 'or', '(', ')'];

export const LogicalFilter = ({ setFilteringExpr, setBoolMatrix, slice }) => {
  const [expr, setExpr] = useState(expression);
  const [messageApi, contextHolder] = message.useMessage();
  const measures = useSelector((state) => state.main.measures);
  const diff_measures = useSelector((state) => state.main.diff_measures);
  const filtering_expr = useSelector((state) => state[slice].filtering_expr);

  useEffect(() => {}, []);

  const all_measures = [...measures, ...diff_measures];

  function checkCondition() {
    console.log('CHECKING EXPR: ', expr);
    let formatted_expr = ' ' + expr + ' ';
    try {
      console.log('GENERATING BOOL MATRIX...');
      const bool_matrix = generateBoolMatrix(formatted_expr);
      store.dispatch(setFilteringExpr(formatted_expr));
      store.dispatch(setBoolMatrix(bool_matrix));
      messageApi.open({
        type: 'success',
        content: 'Condition is well formed'
      });
    } catch (error) {
      store.dispatch(setFilteringExpr(''));
      store.dispatch(setBoolMatrix([]));
      messageApi.open({
        type: 'error',
        content: error.message
      });
    }
  }

  function resetCondition() {
    store.dispatch(setFilteringExpr(''));
    store.dispatch(setBoolMatrix([]));
  }

  function onChange(e) {
    const text = e.target.value;
    setExpr(text);
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '5px',
        background: 'white',
        padding: '5vh',
        borderRadius: '5px',
        fontSize: '20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          width: '100%'
        }}
      ></div>
      {contextHolder}
      <div className="expressionContainer">
        <div>Logical Expression:&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <Input value={expr} onChange={onChange} style={{ width: '70%' }} />
      </div>

      <div className="expressionContainer">
        Available Measures: &nbsp;&nbsp;
        {all_measures.length === 0
          ? '  No Data'
          : all_measures.map((measure) => (
              <div key={measure.acronim}>
                <Tag> {measure.acronim} </Tag>[ {measure.range[0]}, {measure.range[1]} ]
                &nbsp;&nbsp;
              </div>
            ))}
      </div>

      <div className="expressionContainer">
        Available operators: &nbsp;&nbsp;&nbsp;
        {operators.map((operator) => (
          <div key={operator}>
            <Tag> {operator} </Tag>
          </div>
        ))}
      </div>

      <div className="expressionContainer">
        {' '}
        Applied Expression:&nbsp;&nbsp;&nbsp;{filtering_expr}
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        <Button type="primary" onClick={checkCondition}>
          Filter
        </Button>
        <Button type="primary" onClick={resetCondition}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default LogicalFilter;
