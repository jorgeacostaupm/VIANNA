export const CORRELATION_METHODS = [
  { value: "pearson", label: "Pearson (r)", symbol: "r" },
  { value: "spearman", label: "Spearman (rho)", symbol: "rho" },
  { value: "kendall", label: "Kendall (tau)", symbol: "tau" },
];

export const COLOR_SCALES = [
  { value: "rdBu", label: "Red-Blue (RdBu)", interpolator: "interpolateRdBu" },
  {
    value: "rdYlBu",
    label: "Red-Yellow-Blue (RdYlBu)",
    interpolator: "interpolateRdYlBu",
  },
  {
    value: "rdYlGn",
    label: "Red-Yellow-Green (RdYlGn)",
    interpolator: "interpolateRdYlGn",
  },
  { value: "brBG", label: "Brown-Green (BrBG)", interpolator: "interpolateBrBG" },
  { value: "piYG", label: "Pink-Green (PiYG)", interpolator: "interpolatePiYG" },
  { value: "prGn", label: "Purple-Green (PRGn)", interpolator: "interpolatePRGn" },
  {
    value: "puOr",
    label: "Orange-Purple (PuOr)",
    interpolator: "interpolatePuOr",
  },
  {
    value: "spectral",
    label: "Spectral (Spectral)",
    interpolator: "interpolateSpectral",
  },
];

export const COLOR_SCALE_MAP = COLOR_SCALES.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const CORRELATION_METHOD_MAP = CORRELATION_METHODS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});
