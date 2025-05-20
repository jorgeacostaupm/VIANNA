import { Field } from 'formik';
import { useField } from 'formik';
import { Input } from 'antd';
import { useSelector } from 'react-redux';

const NodeDescriptionField = ({ desc }) => {
  const [field, meta, helpers] = useField('desc'); // Meta y helpers para manejar cambios

  function onChange(e) {
    const value = e.target.value;
    helpers.setValue(value); // Actualiza el valor en Formik
    console.log(value);
  }

  return (
    <Input.TextArea
      id="desc"
      {...field}
      rows={1}
      style={{ height: '20vh' }}
      onChange={onChange}
      value={field.value}
    />
  );
};

export default NodeDescriptionField;
