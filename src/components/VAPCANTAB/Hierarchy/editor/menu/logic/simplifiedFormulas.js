import { get_parser } from "./parser";
import { build_aggregation } from "./formularGenerator";

const generateFormula = (operation, attributes) => {

    if (operation === "custom") return;
    let formula = "";
    
    if (operation === "sum") {
        formula = attributes.map((n) => `$(${n.name})`).join(" + ");
    } else if (operation === "concat") {
        formula = attributes.map((n) => `string($(${n.name}))`).join(" + ");
    } else {
        let totalWeights = 0;
        formula = attributes
            .map((n) => {
                totalWeights += n.weight;
                return `${n.weight || 1} * $(${n.name})`;
            })
            .join(" + ");

        formula = `( ${formula} ) / ${totalWeights}`;
    }
  
    return formula;
};

let parser = get_parser();
export const generateFormulaSimplified = (operation, attributes) => {
    const formula = generateFormula(operation, attributes);

    let parsed = null;
    let exec = null;
    
    try { parsed = parser.parse(formula); } 
    catch (error) { return {valid: false, msg: "Fallo de Sintaxis al crear la fórmula"}; }

    try { exec = build_aggregation(parsed)["formula"]; } 
    catch (error) { return {valid: false, msg: `${error.error}: ${error.msg}`}; }
    
    return { valid: true, formula, exec };
};
