import * as aq from "arquero";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  setDataframe,
  updateDataAppVariables,
  updateFromImport,
  updateFromJSON,
} from "../data/dataSlice";

import {
  generateAggregation,
  generateAggregationBatch,
} from "../data/modifyReducers";

import {} from "@/components/VAPUtils/Constants";

import {
  ID_VARIABLE,
  DEFAULT_POPULATION_VARIABLE,
  DEFAULT_TIME_VARIABLE,
} from "@/components/VAPCANTAB/Utils/constants/Constants";

import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

// Thunks
export const setTimeVar = createAsyncThunk(
  "cantab/setTimeVar",
  async (timeVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.dataframe;

    return {
      time_var: timeVar,
      times: [...new Set(dataframe.map((d) => d[timeVar]))],
      selection_times: [...new Set(dataframe.map((d) => d[timeVar]))],
    };
  }
);

export const setGroupVar = createAsyncThunk(
  "cantab/setGroupVar",
  async (groupVar, { getState }) => {
    const state = getState();
    const dataframe = state.dataframe.dataframe;

    return {
      group_var: groupVar,
      populations: [...new Set(dataframe.map((d) => d[groupVar]))],
      selection_populations: [...new Set(dataframe.map((d) => d[groupVar]))],
    };
  }
);

// Initial

const initialState = {
  selectedIds: [],
  scenarioRunResults: [],

  notApi: null,
  init: false,

  attr_width: 20,

  quarantineData: null,
  quarantineSelection: null,
  filteredData: null,

  pop_metadata: null,

  preTransforms: null,
  descriptions: {},

  times: null,
  populations: null,

  selection: null,
  selection_times: null,
  selection_populations: null,

  time_var: DEFAULT_TIME_VARIABLE,
  group_var: DEFAULT_POPULATION_VARIABLE,
  idVar: ID_VARIABLE,
};

// Reducers

const cantabSlice = createSlice({
  name: "cantab",
  initialState,
  reducers: {
    setInit: (state, action) => {
      state.init = action.payload;
    },

    /* setData: (state, action) => {
      state.data = action.payload;
      state.selection = action.payload;
      state.populations = [...new Set(action.payload.map((d) => d[state.group_var]))];
      state.times = [...new Set(action.payload.map((d) => d[state.time_var]))];
      state.selection_populations = [...new Set(action.payload.map((d) => d[state.group_var]))];
      state.selection_times = [...new Set(action.payload.map((d) => d[state.time_var]))];
    }, */

    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },

    setQuarantineData: (state, action) => {
      state.quarantineData = action.payload;
    },

    setScenarioRunResults: (state, action) => {
      state.scenarioRunResults = action.payload;
    },
    setSelectedIds: (state, action) => {
      state.selectedIds = action.payload;
    },

    setPreTransforms: (state, action) => {
      state.preTransforms = action.payload;
    },
    setDescriptions: (state, action) => {
      state.descriptions = action.payload;
    },
    setSelection: (state, action) => {
      state.selection = action.payload;
      state.selection_populations = [
        ...new Set(action.payload.map((d) => d[state.group_var])),
      ];
      state.selection_times = [
        ...new Set(action.payload.map((d) => d[state.time_var])),
      ];
    },
    setQuarantineSelection: (state, action) => {
      state.quarantineSelection = action.payload;
    },
    /* setTimeVar: (state, action) => {
      state.time_var = action.payload;
      state.times = [...new Set(state.data.map((d) => d[state.time_var]))];
      state.selection_times = [...new Set(state.data.map((d) => d[state.time_var]))];
    },
    setGroupVar: (state, action) => {
      state.group_var = action.payload;
      state.populations = [...new Set(state.data.map((d) => d[state.group_var]))];
      state.selection_populations = [...new Set(state.data.map((d) => d[state.group_var]))];
    }, */
    setAttrWidth: (state, action) => {
      state.attr_width = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setDataframe, (state, action) => {
        const items = action.payload;
        state.selection = items;
        state.populations = [...new Set(items.map((d) => d[state.group_var]))];
        state.times = [...new Set(items.map((d) => d[state.time_var]))];
        state.selection_populations = [
          ...new Set(items.map((d) => d[state.group_var])),
        ];
        state.selection_times = [
          ...new Set(items.map((d) => d[state.time_var])),
        ];
      })
      .addCase(setTimeVar.fulfilled, (state, action) => {
        state.time_var = action.payload.time_var;
        state.times = action.payload.times;
        state.selection_times = action.payload.selection_times;
      })
      .addCase(setGroupVar.fulfilled, (state, action) => {
        state.group_var = action.payload.group_var;
        state.populations = action.payload.populations;
        state.selection_populations = action.payload.selection_populations;
      });

    builder
      .addCase(updateDataAppVariables.fulfilled, (state, action) => {
        const configuration = {
          message: "Variables Assigned",
          description: "",
          placement: "topRight",
          type: "success",
        };
        publish("notification", configuration);
      })
      .addCase(updateDataAppVariables.rejected, (state, action) => {
        const configuration = {
          message: "Error Assigning Variables",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(updateFromJSON.fulfilled, (state, action) => {
      const items = action.payload.items;
      state.selection = items;
      state.populations = [...new Set(items.map((d) => d[state.group_var]))];
      state.times = [...new Set(items.map((d) => d[state.time_var]))];
      state.selection_populations = [
        ...new Set(items.map((d) => d[state.group_var])),
      ];
      state.selection_times = [...new Set(items.map((d) => d[state.time_var]))];

      /* const metadata = generateMetadata(items, state.group_var, state.time_var, state.populations);
      state.pop_metadata = metadata; 
      */

      const configuration = {
        message: "Data Loaded",
        description: "",
        placement: "bottomRight",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(updateFromJSON.rejected, (state, action) => {
        const configuration = {
          message: "Error Loading Data",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(updateFromImport.fulfilled, (state, action) => {
      const items = action.payload.items;
      state.quarantineData = [];
      state.selection = items;
      state.populations = [...new Set(items.map((d) => d[state.group_var]))];
      state.times = [...new Set(items.map((d) => d[state.time_var]))];
      state.selection_populations = [
        ...new Set(items.map((d) => d[state.group_var])),
      ];
      state.selection_times = [...new Set(items.map((d) => d[state.time_var]))];
      const configuration = {
        message: "Data Loaded",
        description: "",
        placement: "bottomRight",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(updateFromImport.rejected, (state, action) => {
        const configuration = {
          message: "Error Loading Data",
          description: action.payload,
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(generateAggregation.fulfilled, (state, action) => {
      const configuration = {
        message: "Aggregation Computed",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(generateAggregation.rejected, (state, action) => {
        const configuration = {
          message: "Error Computing Aggregation",
          type: "error",
        };
        publish("notification", configuration);
      });

    builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
      state.selection = action.payload;
      const configuration = {
        message: "Hierarchy Aggregations Computed",
        type: "success",
      };
      publish("notification", configuration);
    }),
      builder.addCase(generateAggregationBatch.rejected, (state, action) => {
        const configuration = {
          message: "Error Computing Hierarchy Aggregations",
          type: "error",
        };
        publish("notification", configuration);
      });
  },
});

export default cantabSlice.reducer;
export const {
  setInit,

  setSelection,
  setFilteredData,

  setAttrWidth,

  setPreTransforms,

  setScenarioRunResults,
  setSelectedIds,
  setDescriptions,

  setQuarantineData,
  setQuarantineSelection,
} = cantabSlice.actions;

function generateMetadata(items, population_var, time_var, populations) {
  const df = aq.from(items);
  const age_var = "age";

  const grouped = df.groupby(population_var);

  const meanByPopulation = grouped.rollup({
    mean: aq.op.mean(age_var),
    std: aq.op.stdev(age_var),
    count: aq.op.count(),
  });

  const statistics = meanByPopulation.objects();

  const variableNames = [
    "sex_id",
    "income",
    time_var,
    "ethnic",
    "marital_status",
    "housing",
    "education_level",
    "employment",
  ];
  const tmp = [];
  variableNames.forEach((v) => {
    let g = grouped.groupby(population_var).groupby(population_var, v).count();
    tmp.push(g.objects());
  });

  let metadata = [];

  populations.forEach((pop) => {
    const population = {};
    population.name = pop;

    const s = statistics.find((item) => item[population_var] === pop);
    const age = { mean: s.mean.toFixed(2), std: s.std ? s.std.toFixed(2) : 0 };
    population.age = age;
    population.n_records = s.count;
    population.histograms = [];

    tmp.forEach((item, i) => {
      let values = item.filter((i) => i[population_var] === pop);
      let tmp_list = [];
      let name = variableNames[i];
      values.forEach((v) => {
        let count = v.count;
        let cat_name = v[name];
        let desc = v[name];
        const tmp = { name: cat_name, description: desc, total: count };
        tmp_list.push(tmp);
      });

      const histogram = {};
      histogram.name = name;
      histogram.data = tmp_list;
      population.histograms.push(histogram);
    });

    metadata.push(population);
  });

  return metadata;
}
