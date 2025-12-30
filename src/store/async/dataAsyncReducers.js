import * as aq from "arquero";
import processFormula from "@/utils/processFormula";
import { ORDER_VARIABLE } from "@/utils/Constants";
import { getFileName, getVariableTypes } from "@/utils/functions";
import { setQuarantineData } from "../slices/cantabSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { buildMetaFromVariableTypes } from "../async/metaAsyncReducers";
import { setDataframe } from "../slices/dataSlice";

export const generateColumn = createAsyncThunk(
  "dataframe/agg-generate",
  async ({ colName, formula }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const table = aq.from(dt || []);

      const derivedFn = processFormula(table, formula);

      const data =
        dt && dt.length > 0
          ? table.derive({ [colName]: derivedFn }, { drop: false }).objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq
              .from(qt)
              .derive({ [colName]: derivedFn }, { drop: false })
              .objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  }
);

export const generateColumnBatch = createAsyncThunk(
  "dataframe/agg-generate-batch",
  async ({ cols }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const table = aq.from(dt || []);
      const formated = {};

      cols.forEach((col) => {
        if (col?.info?.exec) {
          formated[col.name] = processFormula(table, col.info.exec);
        }

        /* if (!table.columnNames().includes(col.name)) {
          formated[col.name] = () => null;
        } */
      });

      const data =
        dt && dt.length > 0
          ? table.derive(formated, { drop: false }).objects()
          : null;
      const quarantineData =
        qt && qt.length > 0
          ? aq.from(qt).derive(formated, { drop: false }).objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating batches");
    }
  }
);

export const generateEmpty = createAsyncThunk(
  "dataframe/agg-empty",
  async ({ colName }, { getState, rejectWithValue }) => {
    try {
      const state = getState().dataframe.present;
      const result = aq
        .from(state.dataframe)
        .derive({ [colName]: () => null }, { drop: false })
        .objects();
      return result;
    } catch (error) {
      return rejectWithValue("Empty aggregation failed");
    }
  }
);

export const removeColumn = createAsyncThunk(
  "dataframe/remove-col",
  async ({ colName }, { getState, rejectWithValue }) => {
    try {
      const state = getState().dataframe.present;
      const removed = [colName];
      const result = aq.from(state.dataframe).select(aq.not(removed)).objects();
      return result;
    } catch (error) {
      return rejectWithValue("Failed to remove attribute");
    }
  }
);

export const removeBatch = createAsyncThunk(
  "dataframe/remove-batch",
  async ({ cols }, { getState }) => {
    try {
      const state = getState().dataframe.present;
      const result = aq.from(state.dataframe).select(aq.not(cols)).objects();
      return result;
    } catch (error) {
      return rejectWithValue("Failed to batch remove");
    }
  }
);

export const convertColumnType = createAsyncThunk(
  "dataframe/convertColumnType",
  async ({ column, dtype }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      let dataframe = aq.from(state.dataframe.present.dataframe);

      let newDf;
      switch (dtype) {
        case "number":
          const data = dataframe.objects();
          const hasInvalid = data.some((row) => {
            const val = row[column];
            if (val === null || val === undefined || val === "") return false;
            return isNaN(Number(val));
          });

          if (hasInvalid) {
            const proceed = window.confirm(
              `⚠️ There are non-numeric values in "${column}".
They will be converted to null, and you may lose information.
Do you want to continue?`
            );

            if (!proceed) {
              // Salir sin hacer cambios
              return rejectWithValue("Update aborted by user");
            }
          }
          newDf = dataframe.derive({
            [column]: (r) => {
              const val = r[column];
              if (val === null || val === undefined || val === "") return null; // vacíos se vuelven null
              const num = Number(val);
              return isNaN(num) ? null : num; // solo valores no numéricos se vuelven null
            },
          });
          break;

        case "string":
          newDf = dataframe.derive({
            [column]: aq.escape((r) =>
              r[column] == null ? null : aq.op.string(r[column])
            ),
          });
          break;

        default:
          throw new Error(`Unsupported dtype: ${dtype}`);
      }

      const newData = newDf.objects();

      dispatch(setDataframe(newData));

      return newData;
    } catch (err) {
      console.error(err);
      return rejectWithValue("Error converting column type");
    }
  }
);

export const replaceValuesWithNull = createAsyncThunk(
  "dataframe/replaceValuesWithNull",
  async (value, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      let dataframe = state.dataframe.present.dataframe;
      let quarantineData = state.cantab.present.quarantineData || [];
      const cols = state.metadata.attributes;

      dataframe = dataframe.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] == value) {
            newRow[key] = null;
          }
        });
        return newRow;
      });

      quarantineData = quarantineData.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] == value) {
            newRow[key] = null;
          }
        });
        return newRow;
      });

      dispatch(setDataframe(dataframe));
      dispatch(setQuarantineData(quarantineData));

      await dispatch(generateColumnBatch({ cols }));

      return {
        value,
      };
    } catch (err) {
      return rejectWithValue("Something went wrong nullifiying values");
    }
  }
);

export const updateData = createAsyncThunk(
  "dataframe/load-import",
  async (
    { data, filename, isGenerateHierarchy },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let dt = aq.from(data);
      let meta = getVariableTypes(data);
      dt = dt.derive({ [ORDER_VARIABLE]: aq.op.row_number() });
      if (isGenerateHierarchy) {
        dispatch(buildMetaFromVariableTypes(meta));
      }
      return {
        filename: getFileName(filename),
        items: dt.objects(),
        columnNames: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
        varTypes: meta,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);
