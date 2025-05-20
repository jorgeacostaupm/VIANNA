import DataManager from '../../managers/DataManager';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from 'antd';

const utils = DataManager.getInstance();

export const AttributeSelector = ({ slice, attr, setAttr }) => {
  const dispatch = useDispatch();
  const attribute = useSelector((state) => state[slice][attr]);

  const types = useSelector((state) => state.main.types);
  const measures = useSelector((state) => state.main.measures);
  const bands = useSelector((state) => state.main.bands);

  const onChange = (key) => (value, item) => {
    const payload = utils.getCopy(attribute);
    payload[key] = item.data;
    dispatch(setAttr(payload));
  };
  const menu_types = utils.getMenuItems(types);
  const menu_measures = utils.getMenuItems(measures);
  const menu_bands = utils.getMenuItems(bands);

  const type = utils.getMenuItem(attribute.type);
  const measure = utils.getMenuItem(attribute.measure);
  const band = utils.getMenuItem(attribute.band);

  return (
    <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
      <div>Type:</div>
      <Select
        value={type}
        onChange={onChange('type')}
        options={menu_types}
        style={{ width: '100%' }}
      />

      <div>Measure:</div>

      <Select
        value={measure}
        onChange={onChange('measure')}
        options={menu_measures}
        style={{ width: '100%' }}
      />

      <div>Band:</div>
      <Select
        value={band}
        onChange={onChange('band')}
        options={menu_bands}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default AttributeSelector;
