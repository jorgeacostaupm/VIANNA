import { useState } from 'react';
import { Field, FieldArray } from 'formik';

import CustomMeasure from './custom/CustomMeasure';

const NodeMeasureConfig = ({ aggOp, children, vals }) => {
  const [isCollapse, collapseSection] = useState(false);

  return <CustomMeasure nodes={children} formula={vals.info.formula}></CustomMeasure>;
};

export default NodeMeasureConfig;
