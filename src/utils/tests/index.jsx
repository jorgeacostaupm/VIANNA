import { anova } from "./numerical/ANOVA";
import { welschAnova } from "./numerical/ANOVA_Welsh";
import { kruskalWallis } from "./numerical/Kruskal_Wallis";
import { tTest } from "./numerical/StudentT";
import { welchTest } from "./numerical/WelschT";
import { mannWhitney } from "./numerical/Mann_Whitney_U";

const tests = [
  anova,
  welschAnova,
  kruskalWallis,
  tTest,
  welchTest,
  mannWhitney,
];

export default tests;
