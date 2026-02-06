import { anova } from "./numerical/ANOVA";
import { welschAnova } from "./numerical/ANOVA_Welsh";
import { kruskalWallis } from "./numerical/Kruskal_Wallis";
import { tTest } from "./numerical/StudentT";
import { welchTest } from "./numerical/WelschT";
import { mannWhitney } from "./numerical/Mann_Whitney_U";

import { chiSquareIndependence } from "./categorical/ChiSquared";

const testMeta = {
  "anova-one-way": {
    shortDescription: "Compares means of k independent groups with ANOVA.",
    referenceUrl:
      "https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/onewayan.htm",
  },
  "anova-welch": {
    shortDescription: "One-way ANOVA without assuming equal variances (Welch).",
    referenceUrl:
      "https://poc.vl-e.nl/distribution/manual/R-2.2.0/library/stats/html/oneway.test.html",
  },
  "kruskal-wallis-test": {
    shortDescription:
      "Non-parametric alternative to ANOVA for k independent groups.",
    referenceUrl:
      "https://search.r-project.org/R/refmans/stats/html/kruskal.test.html",
  },
  "t-test-independent": {
    shortDescription:
      "Compares means of two independent groups (Student's t-test).",
    referenceUrl:
      "https://search.r-project.org/CRAN/refmans/stats/html/t.test.html",
  },
  "t-test-welch": {
    shortDescription: "Two-sample t-test with unequal variances (Welch).",
    referenceUrl:
      "https://search.r-project.org/CRAN/refmans/stats/html/t.test.html",
  },
  "mann-whitney-u": {
    shortDescription: "Non-parametric comparison of two independent groups.",
    referenceUrl:
      "https://web.mit.edu/r/current/lib/R/library/stats/html/wilcox.test.html",
  },
  "yuen-t-test": {
    shortDescription: "Robust comparison using trimmed means (Yuen).",
    referenceUrl:
      "https://mirror.las.iastate.edu/CRAN/web/packages/WRS2/refman/WRS2.html",
  },
  "chi-square-independence": {
    shortDescription: "Chi-square test of independence for contingency tables.",
    referenceUrl:
      "https://itl.nist.gov/div898/software/dataplot/refman1/auxillar/chistest.htm",
  },
};

const tests = [
  anova,
  welschAnova,
  kruskalWallis,
  tTest,
  welchTest,
  mannWhitney,

  chiSquareIndependence,
];

const enrichedTests = tests.map((test) => {
  const meta = testMeta[test.id] || {};
  return {
    ...test,
    shortDescription: meta.shortDescription ?? test.description ?? "",
    referenceUrl: meta.referenceUrl ?? "",
  };
});

export default enrichedTests;
