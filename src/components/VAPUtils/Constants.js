const OLMO_LINK_APACHE = 'http://olmo.datsi.fi.upm.es/connectivity_api';
const OLMO_LINK = 'http://olmo.datsi.fi.upm.es:8007';
const LOCAL_LINK = 'http://127.0.0.1:8000';
const SERVER_LINK = '/vis_server';

export const API_LINK = OLMO_LINK;

export const available_statistics = [
  {
    name: 'Max',
    acronim: 'max',
    range: [2, 50],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Min',
    acronim: 'min',
    range: [2, 50],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Mean',
    acronim: 'mean',
    range: [2, 50],
    unit: 'Hz',
    description: 'some description',
    active: true
  }
];

export const available_bands = [
  {
    name: 'Delta',
    acronim: 'delta',
    range: [2, 4],
    unit: 'Hz',
    description:
      'some descriptionsdescriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome description',
    active: true
  },
  {
    name: 'Theta',
    acronim: 'theta',
    unit: 'Hz',
    range: [4, 7],
    description: 'some descriptionsome descriptionsome descriptionsome description',
    active: true
  },
  {
    name: 'Alpha Low',
    acronim: 'alpha_low',
    range: [8, 10],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Alpha High',
    acronim: 'alpha_high',
    range: [10, 12],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Beta Low',
    acronim: 'beta_low',
    range: [12, 20],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Beta High',
    acronim: 'beta_high',
    range: [20, 30],
    unit: 'Hz',
    description: 'some description',
    active: true
  },
  {
    name: 'Gamma',
    acronim: 'gamma',
    range: [30, 50],
    unit: 'Hz',
    description: 'some description',
    active: true
  }
];

export const available_measures = [
  {
    name: 'PLV',
    acronim: 'plv',
    range: [0, 1],
    description: 'some description',
    selected_range: [0, 1],
    active: true
  },
  {
    name: 'ciPLV',
    acronim: 'ciplv',
    range: [-1, 1],
    description:
      'some descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome descriptionsome description',
    selected_range: [-1, 1],
    active: true
  }
];

export const SQUARE_LENGTH = 500;

export const DISTANCES = [
  {
    value: 'euclidean',
    label: 'L2'
  },
  {
    value: 'chebyshev',
    label: 'Chebyshev'
  },
  {
    value: 'hamming',
    label: 'Hamming'
  },
  {
    value: 'manhattan',
    label: 'Manhattan'
  },
  {
    value: 'jaccard',
    label: 'Jaccard'
  },
  {
    value: 'braycurtis',
    label: 'Braycurtis'
  }
];

export const ALGORITHMS = [
  {
    value: 'optimal_leaf',
    label: 'Optimal'
  },
  /*   {
    value: "optimal_leaf_distance",
    label: "OL Distance",
    da ceros en a permutacion ???
  }, */
  {
    value: 'anatomical',
    label: 'Anatomical'
  },
  {
    value: 'spectral',
    label: 'Spectral'
  },
  {
    value: 'pca',
    label: 'PCA'
  },
  {
    value: 'cuthill',
    label: 'Cuthil'
  },
  {
    value: 'rcm',
    label: 'Inverse'
  }
];

const SIMULTANEOUS_ALGORITHMS = [
  {
    value: 'simultaneous',
    label: 'Simultaneous'
  }
];

export const SMALL_ALGORITHMS = [...ALGORITHMS, ...SIMULTANEOUS_ALGORITHMS];

export const EVENTS = Object.freeze({
  HOVER_MATRIX_LINK: 0,
  HOVER_OUT_MATRIX_LINK: 1,
  ZOOM_MATRIX_BRUSH: 2,
  ZOOM_MATRIX_SELECTED_NODES: 3,
  RESET_ZOOM_MATRIX: 4,
  CLICK_MATRIX_NODE: 5,
  CLICK_MATRIX_LINK: 6,
  RESET_MATRIX_NODE_SELECTION: 7,
  RESET_MATRIX_LINK_SELECTION: 8,
  SELECT_MATRIX_BRUSH: 10,
  UNSELECT_MATRIX_BRUSH: 11,
  ZOOM_MATRIX_SELECTED_LINKS: 12,
  RESET_MATRIX_GEOMETRIC_ZOOM: 13,
  SHOW_LINKS_IN_ATLAS: 14,
  RESET_ATLAS: 15,
  CLICK_CIRCULAR_NODE: 16,
  RESET_CIRCULAR_NODE_SELECTION: 17,
  CLICK_CIRCULAR_LINK: 18,
  RESET_CIRCULAR_GEOMETRIC_ZOOM: 19,
  HOVER_CIRCULAR_NODE: 20,
  HOVER_OUT_CIRCULAR_NODE: 21,
  HOVER_CIRCULAR_LINK: 22,
  HOVER_OUT_CIRCULAR_LINK: 23
});

export const DEFAULT_ORDER_VARIABLE = 'myIdVariable';
export const DEFAULT_POPULATION_VARIABLE = '__population';
export const DEFAULT_TIME_VARIABLE = '__time';
export const DEFAULT_DESCRIPTION_VARIABLE = '__description';

export const HIDDEN_VARIABLES = [DEFAULT_ORDER_VARIABLE, DEFAULT_DESCRIPTION_VARIABLE];
