import {
  clusterData,
  euclideanDistance,
  averageDistance,
} from "@greenelab/hclust";

import {
  EmbeddingsExtractor,
  cosineDistance,
  pruneTree,
  quantile,
} from "./semantic/semantic";
import { DataType } from "@/utils/Constants";

function hierarchicalToMeta(clusters, variables, maxDepth) {
  // start with variables (reset index)
  let nodes = variables.map((v, i) => ({ ...v, id: i + 1, isShown: true }));

  let current = variables.length;
  const addAggregation = (node, height = 0) => {
    if (node.indexes.length == 1) return node.indexes[0] + 1;

    let id;
    if (height > maxDepth) {
      current++;
      id = current;
      nodes.push({
        id: id,
        name: `Aggregation ${id}`,
        desc: "",
        isShown: true,
        type: "aggregation",
        dtype: DataType.UNKNOWN.dtype,
        info: {
          operation: "concat",
          usedAttributes: [],
          formula: "",
          exec: "(r) => null",
        },
        related: node.indexes.map((i) => i + 1),
      });
    } else {
      const left = addAggregation(node.children[0], height + 1);
      const right = addAggregation(node.children[1], height + 1);

      current++;
      id = current;

      nodes.push({
        id: id,
        name: `Aggregation ${id}`,
        desc: "",
        type: "aggregation",
        dtype: DataType.UNKNOWN.dtype,
        isShown: true,
        info: {
          operation: "concat",
          usedAttributes: [],
          formula: "",
          exec: "(r) => null",
        },
        related: [left, right],
      });
    }
    return id;
  };

  addAggregation(clusters, 0);

  const rootConnections = nodes[nodes.length - 1].related;
  nodes[nodes.length - 1] = {
    id: 0,
    name: "root",
    desc: "Root",
    type: "root",
    dtype: DataType.UNKNOWN.dtype,
    isShown: true,
    related: rootConnections,
  };

  nodes.sort((a, b) => a.id - b.id);
  return nodes;
}

/*
actions:
- isLoaded: returns { status: 'state', name: 'model', loaded: true | false}
- preLoad: returns { status: 'state', name: 'model', loaded: true }
- autoHier: return { status: 'done', name: 'clustering', data: data}

mid results: 
- progress (load): { status: 'progress' name: '' progress: 20.4, file: ''}
*/

function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

function isLoaded() {
  self.postMessage({
    status: "state",
    name: "model",
    loaded: EmbeddingsExtractor.isLoaded(),
  });
}

function getTreeHeights(clusters) {
  let heights = [];
  const getHeight = (node) => {
    heights.push(node.height);
    if (node.children != null) {
      node.children.forEach(getHeight);
    }
  };
  getHeight(clusters);
  return heights;
}

async function semanticCreation(data, config) {
  let extractor = await EmbeddingsExtractor.getInstance((x) => {
    self.postMessage(x);
  });
  self.postMessage({
    status: "state",
    name: "model",
    loaded: EmbeddingsExtractor.isLoaded(),
  });

  const getEmbedding = async (item) => {
    const { name, desc } = item;
    const text = `${name}: ${desc}`;
    const embedding = await extractor(text, {
      normalize: true,
      pooling: "mean",
    });

    return { name: name, vector: embedding.data };
  };

  let finished = 0;
  const total = data.length;
  self.postMessage({
    status: "initiate",
    file: "embeddings",
    name: "clustering",
    progress: 0,
  });
  let transformed = await Promise.all(
    data.map((item, index) => {
      return getEmbedding(item).then((result) => {
        finished++;
        self.postMessage({
          status: "progress",
          file: "embeddings",
          name: "clustering",
          progress: (finished / total) * 100,
        });
        return result;
      });
    })
  ).catch((err) => self.postMessage({ status: "error", msg: err }));

  self.postMessage({
    status: "done",
    file: "embeddings",
    name: "clustering",
    progress: 100,
  });
  self.postMessage({ status: "state", name: "embeddings", loaded: true });
  self.postMessage({
    status: "initiate",
    file: "creación: clustering",
    name: "clustering",
    progress: 0,
  });

  let distanceFunc = euclideanDistance;
  if (config.distance === "euclidean") {
    distanceFunc = euclideanDistance;
  } else if (config.distance === "cosine") {
    distanceFunc = cosineDistance;
  }

  const variables = data;
  transformed = transformed.map((m) => m.vector);

  const { clusters } = clusterData({
    data: transformed,
    distance: distanceFunc,
    linkage: averageDistance,
    onProgress: (p) => {
      self.postMessage({
        status: "progress",
        file: "creación: clustering",
        name: "clustering",
        progress: p * 100,
      });
    },
  });

  const heights = getTreeHeights(clusters);
  const thress = quantile(heights, config.thress);

  pruneTree(clusters, null, thress);
  const result = hierarchicalToMeta(clusters, variables, config.maxDepth);
  self.postMessage({
    status: "done",
    file: "creación: clustering",
    name: "clustering",
    progress: 100,
  });
  self.postMessage({ status: "state", name: "clustering", loaded: true });

  await sleep(500); // to allow the change of the modal status
  self.postMessage({
    status: "return",
    data: result,
    name: "clustering",
  });
}

self.addEventListener("message", async (event) => {
  const { data, action, config } = event.data;

  if (action === "isLoaded") isLoaded();
  else if (action === "clustering") semanticCreation(data, config);
});
