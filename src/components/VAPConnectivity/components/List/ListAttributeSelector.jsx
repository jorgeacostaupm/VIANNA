import { useSelector, useDispatch } from "react-redux";
import { Button, Select, message } from "antd";
import { useState } from "react";
import DataManager from "../../managers/DataManager";

const utils = DataManager.getInstance();

const ListAttributeSelector = ({ addAttr, attrs }) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const types = useSelector((state) => state.main.types);
  const measures = useSelector((state) => state.main.measures);
  const bands = useSelector((state) => state.main.bands);

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
      dispatch(addAttr(new_attr));
    } else {
      messageApi.open({
        type: "error",
        content: "Attribute already displayed",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <div>Select Attribute: </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "5px",
          alignItems: "center",
          marginTop: "5px",
          justifyContent: "center",
        }}
      >
        Type:
        <Select
          defaultValue={menu_types[0]}
          onChange={onChange(setType)}
          options={menu_types}
          style={{ width: "20%" }}
        />
        Measure:
        <Select
          defaultValue={menu_measures[0]}
          onChange={onChange(setMeasure)}
          options={menu_measures}
          style={{ width: "20%" }}
        />
        Band:
        <Select
          defaultValue={menu_bands[0]}
          onChange={onChange(setBand)}
          options={menu_bands}
          style={{ width: "20%" }}
        />
        <Button type="primary" onClick={onClick}>
          Add
        </Button>
      </div>
    </>
  );
};

export default ListAttributeSelector;
