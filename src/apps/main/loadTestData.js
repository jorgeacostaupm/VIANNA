import { updateData } from "@/store/async/dataAsyncReducers";
import {
  updateDescriptions,
  updateHierarchy,
} from "@/store/async/metaAsyncReducers";
import * as api from "@/utils/cantabAppServices";
import { setGroupVar, setIdVar, setTimeVar } from "@/store/slices/cantabSlice";
import { DATASETS } from "@/utils/Constants";

import { pubsub } from "@/utils/pubsub";
import { getFileName } from "@/utils/functions";
const { publish } = pubsub;

const idVar = "pseudon_id";
const groupVar = "site";
const timeVar = "visit";

const env = import.meta?.env?.MODE || process.env.NODE_ENV || "dev";
const { dataPath, hierarchyPath, descriptionsPath } =
  env === "production" ? DATASETS.prod : DATASETS.dev;

export default async function loadTestData(dispatch) {
  try {
    let data = await api.fetchTestData(dataPath);
    await dispatch(
      updateData({
        data,
        isGenerateHierarchy: true,
        filename: dataPath,
      })
    );

    let hierarchy = await api.fetchHierarchy(hierarchyPath);
    await dispatch(updateHierarchy({ hierarchy, filename: hierarchyPath }));

    let descriptions = await api.fetchDescriptionsCSV(descriptionsPath);
    await dispatch(
      updateDescriptions({
        descriptions,
        filename: descriptionsPath,
      })
    );

    dispatch(setIdVar(idVar));
    dispatch(setGroupVar(groupVar));
    dispatch(setTimeVar(timeVar));
  } catch (error) {
    publish("notification", {
      message: "Error Loading Test Data",
      description: error.message,
      type: "error",
    });
  }
}
