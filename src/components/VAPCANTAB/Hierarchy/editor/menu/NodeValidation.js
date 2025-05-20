import * as yup from 'yup';

export const NodeSchema = yup.object({
  id: yup.number().required('All nodes require ID'),
  name: yup.string().required('All nodes require a name'),
  /* dtype: yup.string().required('Se debe indicar el tipo de Dato'), */
  desc: yup.string().default(''),
  related: yup.array(yup.number()).min(0),
  type: yup.mixed().oneOf(['attribute', 'root', 'aggregation']).required(),
  info: yup.object().when('type', (val, schema) => {
    if (val == 'aggregation') {
      return yup
        .object({
          operation: yup.mixed().oneOf(['sum', 'concat', 'mean', 'custom']).required(),
          formula: yup.string().when('operation', (val, schema) => {
            if (val == 'custom') {
              return yup
                .string()
                .required('The formula for non-standard aggregations must be added.');
            } else {
              return yup.string().optional();
            }
          }),
          usedAttributes: yup.array(
            yup.object({
              id: yup.number().required('All nodes require ID'),
              name: yup.string().required('All nodes require a name'),
              weight: yup.number().when('info.operation', (val, schema) => {
                if (val == 'mean') {
                  return yup.number().required('A minimum weight must be added.');
                } else {
                  return yup.number().notRequired();
                }
              }),
              used: yup.boolean().required()
            })
          )
        })
        .required();
    } else {
      return yup.object().notRequired();
    }
  })
});

export const MetaDataSchema = yup.array(NodeSchema).min(1);
