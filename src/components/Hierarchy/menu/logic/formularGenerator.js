const availableFuncs = [
  ['length', 1],
  ['slice', 3],
  ['now', 0],
  ['timestamp', 1],
  ['datetime', 7],
  ['year', 1],
  ['quarter', 1],
  ['month', 1],
  ['week', 1],
  ['date', 1],
  ['dayofyear', 1],
  ['dayofweek', 1],
  ['hours', 1],
  ['minutes', 1],
  ['seconds', 1],
  ['milliseconds', 1],
  ['utcdatetime', 1],
  ['utcyear', 1],
  ['utcquarter', 1],
  ['utcmonth', 1],
  ['utcweek', 1],
  ['utcdate', 1],
  ['utcdayofyear', 1],
  ['utcdayofweek', 1],
  ['utchours', 1],
  ['utcminutes', 1],
  ['utcseconds', 1],
  ['utcmilliseconds', 1],
  ['format_date', 2],
  ['format_utcdate', 2],
  ['bin', 4],
  ['random', 0],
  ['sqrt', 1],
  ['abs', 1],
  ['cbrt', 1],
  ['ceil', 1],
  ['clz32', 1],
  ['exp', 1],
  ['expm1', 1],
  ['floor', 1],
  ['fround', 1],
  ['greatest', -1],
  ['least', -1],
  ['log', 1],
  ['log10', 1],
  ['log1p', 1],
  ['log2', 1],
  ['pow', 2],
  ['round', 1],
  ['sign', 1],
  ['sqrt', 1],
  ['trunc', 1],
  ['degrees', 1],
  ['radians', 1],
  ['acos', 1],
  ['acosh', 1],
  ['asin', 1],
  ['asinh', 1],
  ['atan', 1],
  ['atan2', 1],
  ['atanh', 1],
  ['cos', 1],
  ['cosh', 1],
  ['sin', 1],
  ['sinh', 1],
  ['tan', 1],
  ['tanh', 1],
  ['equal', 2],
  ['string', 1],
  ['parse_date', 1],
  ['parse_float', 1],
  ['parse_int', 1],
  ['endswith', 2],
  ['normalize', 1],
  ['padend', 2],
  ['padstart', 2],
  ['lower', 1],
  ['upper', 1],
  ['repeat', 2],
  ['replace', 3],
  ['split', 2],
  ['startswith', 2],
  ['substring', 3],
  ['trim', 1]
];

export function build_aggregation(tokens) {
  let usedAttributes = [];
  function format_op(attr) {
    let output = '';
    switch (attr['data']) {
      case 'suma':
        output = `${format_op(attr['children'][0])} + ${format_op(attr['children'][1])}`;
        break;
      case 'resta':
        output = `${format_op(attr['children'][0])} - ${format_op(attr['children'][1])}`;
        break;
      case 'producto':
        output = `${format_op(attr['children'][0])} * ${format_op(attr['children'][1])}`;
        break;
      case 'division':
        output = `${format_op(attr['children'][0])} / ${format_op(attr['children'][1])}`;
        break;
      case 'potencia':
        output = `${format_op(attr['children'][0])} ** ${format_op(attr['children'][1])}`;
        break;

      case 'or':
        output = `${format_op(attr['children'][0])} || ${format_op(attr['children'][1])}`;
        break;
      case 'and':
        output = `${format_op(attr['children'][0])} && ${format_op(attr['children'][1])}`;
        break;

      case 'le':
        output = `${format_op(attr['children'][0])} <= ${format_op(attr['children'][1])}`;
        break;

      case 'lt':
        output = `${format_op(attr['children'][0])} < ${format_op(attr['children'][1])}`;
        break;

      case 'ge':
        output = `${format_op(attr['children'][0])} >= ${format_op(attr['children'][1])}`;
        break;

      case 'gt':
        output = `${format_op(attr['children'][0])} > ${format_op(attr['children'][1])}`;
        break;

      case 'equality':
        output = `${format_op(attr['children'][0])} == ${format_op(attr['children'][1])}`;
        break;
      case 'inequality':
        output = `${format_op(attr['children'][0])} != ${format_op(attr['children'][1])}`;
        break;
      case 'negacion':
        output = `!(${format_op(attr['children'][0])})`;
        break;

      case 'parentesis':
        output = `(${format_op(attr['children'][0])})`;
        break;

      case 'function':
        output = format_func(attr);
        break;

      case 'true':
        output = 'true';
        break;
      case 'false':
        output = 'false';
        break;
      case 'texto':
        output = `${attr['children'][0].value}`;
        break;
      case 'numero':
        output = attr['children'][0].value;
        break;

      case 'natural':
        output = 'Math.E ';
        break;

      case 'attribute':
        output = format_attr(attr);
        break;

      case 'value':
        output = format_op(attr['children'][0]);
        break;

      case 'indexing':
        output = `${format_op(attr['children'][0])}[${format_op(attr['children'][1])}]`;
        break;
      case 'indexing2':
        output = `${format_op(attr['children'][0])}[${format_op(attr['children'][1])}]`;
        break;

      default:
        output = '';
        console.error('unknown', attr['data']);
        break;
    }
    return output;
  }

  const FUNC_MAP = availableFuncs;

  function format_func(attr) {
    const funcName = attr['children'][0]['value'];
    const funcIndex = FUNC_MAP.findIndex((f) => f[0] === funcName);

    if (funcIndex === -1) {
      throw {
        error: 'VariableNotDeclared',
        msg: `The function "${funcName}" doesn't exist. Available functions: ${FUNC_MAP.map(
          (f) => f[0]
        ).join(', ')}`
      };
    }

    if (FUNC_MAP[funcIndex] < attr['children'].length - 1) {
      throw {
        error: 'VariableNotDeclared',
        msg: `The function "${funcName}" accepts a maximum of ${FUNC_MAP[funcIndex]} elements.`
      };
    }

    const interior = attr['children'].slice(1).map(format_op).join(', ');
    return `${funcName}(${interior})`;
  }

  function format_attr(attr) {
    usedAttributes.push(attr['children'][0]['value']);
    return `r["${attr['children'][0]['value']}"]`;
  }

  const formula = `(r) => ${format_op(tokens)} `;
  return {
    formula: formula,
    nodes: usedAttributes
  };
}
