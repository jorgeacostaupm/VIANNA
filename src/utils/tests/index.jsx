import { anova } from "./numerical/ANOVA";
import { welschAnova } from "./numerical/ANOVA_Welsh";
import { kruskalWallis } from "./numerical/Kruskal_Wallis";
import { tTest } from "./numerical/StudentT";
import { welchTest } from "./numerical/WelschT";
import { mannWhitney } from "./numerical/Mann_Whitney_U";
import { chiSquareIndependence } from "./categorical/ChiSquared";
import { repeatedMeasuresANOVA } from "./numerical/PairedANOVA";
import { pairedTTest } from "./numerical/PairedStudentT";

const tests = [
  anova,
  welschAnova,
  kruskalWallis,
  repeatedMeasuresANOVA,
  pairedTTest,
  tTest,
  welchTest,
  mannWhitney,
];

export default tests;
