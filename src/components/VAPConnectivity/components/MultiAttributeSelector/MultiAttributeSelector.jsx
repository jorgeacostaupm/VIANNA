import DataManager from '../../managers/DataManager';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Select, message } from 'antd';
import { useState } from 'react';
import ViewsManager from '../../managers/ViewsManager';

const utils = DataManager.getInstance();
const manager = ViewsManager.getInstance();

export const MultiAttributeSelector = ({ slice, option, addMultiAttr }) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const attrs = useSelector((state) => state[slice].multi_attrs);

  const types = useSelector((state) => state.main.types);
  const measures = useSelector((state) => state.main.measures);
  const bands = useSelector((state) => state.main.bands);
  const attr = useSelector((state) => state[slice][option + '_attr']);

  const menu_types = utils.getMenuItems(types);
  const menu_measures = utils.getMenuItems(measures);
  const menu_bands = utils.getMenuItems(bands);

  const [type, setType] = useState(types[0]);
  const [measure, setMeasure] = useState(measures[0]);
  const [band, setBand] = useState(bands[0]);

  const onChange = (setter) => (value, item) => {
    setter(item.data);
  };

  const onClick = () => {
    const new_attr = utils.getCopy({ type, measure, band });
    const attributeExists = attrs.some(
      (attr) =>
        attr.type.acronim === new_attr.type.acronim &&
        attr.measure.acronim === new_attr.measure.acronim &&
        attr.band.acronim === new_attr.band.acronim
    );

    if (!attributeExists) {
      manager.init = false;
      dispatch(addMultiAttr(new_attr));
    } else {
      messageApi.open({
        type: 'error',
        content: 'Attribute already displayed'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {contextHolder}
      <div>Type:</div>
      <Select
        defaultValue={menu_types[0]}
        onChange={onChange(setType)}
        options={menu_types}
        style={{ width: '100%' }}
      />
      <div>Measure:</div>
      <Select
        defaultValue={menu_measures[0]}
        onChange={onChange(setMeasure)}
        options={menu_measures}
        style={{ width: '100%' }}
      />
      <div>Band:</div>
      <Select
        defaultValue={menu_bands[0]}
        onChange={onChange(setBand)}
        options={menu_bands}
        style={{ width: '100%' }}
      />
      <div
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Button type="primary" onClick={onClick}>
          Add {slice.charAt(0).toUpperCase() + slice.slice(1)}
        </Button>
      </div>
    </div>
  );
};

export default MultiAttributeSelector;
