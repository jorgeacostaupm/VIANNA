import * as ss from 'simple-statistics';
import store from '@/components/VAPUtils/features/store';

import {
  DEFAULT_ORDER_VARIABLE,
  HIDDEN_VARIABLES
} from '@/components/VAPCANTAB/Utils/constants/Constants';

import { startWorker as startCorrelationWorker } from '@/components/VAPUtils/features/correlation/correlationSlice';
export function computeCorrelationMatrixDataOnWorker(data, columns, selectedPopulations, groupVar) {
  store.dispatch(startCorrelationWorker([data, columns, selectedPopulations, groupVar]));
}

export function computeCorrelationMatrixData(data, columns, groups, groupVar) {
  const result = {};
  console.log(data, columns);

  columns.filter((d) => !HIDDEN_VARIABLES.includes(d));

  for (const item of data) {
    if (groups.includes(item[groupVar])) {
      for (const column of columns) {
        if (!result[column]) {
          result[column] = [];
        }
        result[column].push(+item[column]);
      }
    }
  }
  let dt = aq.table(result);
  const dataset = dt.select(columns).objects();
  const correlation_matrix = computeCorrelationMatrix(dataset);
  return correlation_matrix;
}

function computeCorrelationMatrix(dataset) {
  const keys = getKeys(dataset).reverse();
  const correlationMatrix = [];

  for (let i = 0; i < keys.length; i++) {
    const column1 = getColumnValues(dataset, keys[i]);

    for (let j = i; j < keys.length; j++) {
      const column2 = getColumnValues(dataset, keys[j]);
      // Returns NaN if an element of any array is NaN
      const correlation = ss.sampleCorrelation(column1, column2);

      correlationMatrix.push({
        x: keys[i],
        y: keys[j],
        value: correlation
      });

      if (i !== j) {
        // For non-diagonal elements, also add the symmetric entry
        correlationMatrix.push({
          x: keys[j],
          y: keys[i],
          value: correlation
        });
      }
    }
  }

  return correlationMatrix;
}

function getKeys(dataset) {
  return Object.keys(dataset[0]);
}

function getColumnValues(dataset, key) {
  return dataset.map((item) => item[key]);
}
