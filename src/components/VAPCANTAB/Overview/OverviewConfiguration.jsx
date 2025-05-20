import React, { useState } from 'react';
import { Button, Input, Slider, Form, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setAttrWidth } from '@/components/VAPUtils/features/cantab/cantabSlice';
import { updateDataAppVariables } from '@/components/VAPUtils/features/data/dataSlice';

const { Option } = Select;

const SearchableSelect = ({ name, label, rules, placeholder, value }) => {
  const variables = useSelector((state) => state.dataframe.navioColumns);
  const allOptions = variables.map((v) => ({ value: v, label: v }));
  const [options, setOptions] = useState(allOptions);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSearch = (searchValue) => {
    if (!searchValue) {
      setOptions(allOptions); // Restaurar las opciones originales
    } else {
      const filteredOptions = allOptions.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      setOptions(filteredOptions);
    }
  };

  return (
    <Form.Item name={name} label={label} rules={rules} initialValue={value}>
      <Select
        showSearch
        defaultValue={value}
        placeholder={placeholder}
        onSearch={handleSearch}
        filterOption={false}
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

const SetVars = () => {
  const group_var = useSelector((state) => state.cantab.group_var);
  const time_var = useSelector((state) => state.cantab.time_var);
  const dispatch = useDispatch();

  const onFinish = (values) => {
    dispatch(updateDataAppVariables(values));
  };

  return (
    <Form onFinish={onFinish} layout="horizontal" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
      <SearchableSelect
        name="population"
        label="Population"
        value={group_var}
        placeholder="Select a population variable"
        rules={[
          {
            required: true,
            message: 'Please input a Population variable!'
          }
        ]}
      />
      <SearchableSelect
        name="time"
        label="Time"
        value={time_var}
        placeholder="Select a time variable"
        rules={[
          {
            required: true,
            message: 'Please input a Time variable!'
          }
        ]}
      />
      <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type="primary" htmlType="submit">
          Set Variables
        </Button>
      </Form.Item>
    </Form>
  );
};

const OverviewConfiguration = () => {
  const dispatch = useDispatch();
  const attr_width = useSelector((state) => state.cantab.attr_width);

  const onSliderComplete = (value) => {
    dispatch(setAttrWidth(value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ fontSize: '16px' }}>Attribute Width:</div>
      <Slider
        min={15}
        max={50}
        defaultValue={attr_width}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: '100%' }}
      />
      <SetVars />
    </div>
  );
};

export default OverviewConfiguration;
