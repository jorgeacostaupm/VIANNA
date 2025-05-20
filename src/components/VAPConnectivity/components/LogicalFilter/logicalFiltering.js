import DataManager from '../../managers/DataManager';
import store from '@/components/VAPUtils/features/store';

const utils = DataManager.getInstance();

function verifyBrackets(expr) {
  let stack = [];

  // Expresión solo con paréntesis, corchetes y llaves
  let filteredExpr = expr.replace(/[^(){}\[\]]/g, '');

  for (let i = 0; i < filteredExpr.length; i++) {
    let x = filteredExpr[i];

    if (x == '(' || x == '[' || x == '{') {
      stack.push(x);
      continue;
    }

    if (stack.length == 0) return false;

    let check;
    switch (x) {
      case ')':
        check = stack.pop();
        if (check == '{' || check == '[') return false;
        break;

      case '}':
        check = stack.pop();
        if (check == '(' || check == '[') return false;
        break;

      case ']':
        check = stack.pop();
        if (check == '(' || check == '{') return false;
        break;
    }
  }

  return stack.length == 0;
}

function verifySpaces(expr) {
  const characters = ['(', '[', ')', ']'];

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (characters.includes(char)) {
      if (expr[i - 1] !== ' ' || expr[i + 1] !== ' ') {
        return false;
      }
    }
  }

  return true;
}

function verifyNumbers(expr) {
  let dentroCorchetes = false;

  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '[') {
      dentroCorchetes = true;
    } else if (expr[i] === ']') {
      dentroCorchetes = false;
    } else if (dentroCorchetes && isNaN(parseInt(expr[i])) && expr[i] !== '.' && expr[i] !== ' ') {
      return false;
    }
  }

  return true;
}

function verifyWords(expr, wordList) {
  // Extraer palabras de la frase limpia
  let words_in_sentence = expr.split(' ');

  // Filtrar la lista eliminando números, paréntesis y corchetes
  const words = words_in_sentence.filter(
    (elemento) =>
      !/\d/.test(elemento) &&
      elemento !== '' &&
      /*         elemento !== "(" &&
      elemento !== ")" && */
      elemento !== '[' &&
      elemento !== ']'
  );

  for (let i = 0; i < words.length; i++) {
    if (!wordList.includes(words[i])) {
      return false;
    }
  }

  return true;
}

function getKeyWords(words) {
  const key_words = new Set(
    words.filter(
      (elemento) =>
        !/\d/.test(elemento) &&
        elemento !== '' &&
        elemento !== 'and' &&
        elemento !== 'or' &&
        elemento !== '(' &&
        elemento !== ')' &&
        elemento !== '[' &&
        elemento !== ']'
    )
  );

  return Array.from(key_words);
}

function getFilteringMatrices(expr) {
  const matrices = {};

  let words_in_sentence = expr.split(' ');
  const key_words = getKeyWords(words_in_sentence);

  for (let i = 0; i < key_words.length; i++) {
    const word = key_words[i];
    const attr = utils.generateAttrFromWord(word);
    matrices[word] = utils.getMatrix(attr).mean;
  }

  return matrices;
}

function getFilteringMatrix(matrices, expr) {
  let words_in_sentence = expr.split(' ');
  const filtered_words = words_in_sentence.filter(
    (elemento) => !/\d/.test(elemento) && elemento !== '' && elemento !== '[' && elemento !== ']'
  );

  const key_words = getKeyWords(words_in_sentence);
  const n = matrices[key_words[0]].length;
  const numbers = words_in_sentence.filter((elemento) => /\d/.test(elemento));

  let eval_string = ' ';
  let j = 0;
  for (let i = 0; i < filtered_words.length; i++) {
    const word = filtered_words[i];
    if (word === '(' || word === ')') {
      eval_string += ` ${word} `;
    } else if (word === 'or') {
      eval_string += ' || ';
    } else if (word === 'and') {
      eval_string += ' && ';
    } else {
      eval_string += ` Math.abs(matrices['${word}'][x][y]) >  ${numbers[j]}`;
      j++;
    }
  }
  console.log(matrices);
  console.log('EVAL STRING: ' + eval_string);

  let matrix = Array.from({ length: n }, (_, x) =>
    Array.from({ length: n }, (_, y) => eval(eval_string))
  );
  matrix = utils.upperTriangularToSymmetric(matrix);

  return matrix;
}

function generateCompleteString(measure, number) {
  const special_words = ['zscore-plv', 'zscore-ciplv'];

  const bands = store.getState().main.bands.map((measure) => measure.acronim);
  let complete_string = '';
  if (!special_words.includes(measure)) {
    bands.forEach((band, index) => {
      complete_string += 'control-' + measure + '-' + band + ' ' + number + ' or ';
      complete_string += 'study-' + measure + '-' + band + ' ' + number + ' ';

      if (index < bands.length - 1) complete_string += 'or ';
    });
  } else {
    bands.forEach((band, index) => {
      complete_string += measure + '-' + band + ' ' + number + '  ';

      if (index < bands.length - 1) complete_string += 'or ';
    });
  }

  return complete_string;
}

function getCompleteExpr(expr) {
  let copied_expr = utils.getCopy(expr);
  const measures = store.getState().main.measures.map((measure) => measure.acronim);
  const special_words = [...measures, 'zscore-plv', 'zscore-ciplv'];
  let words_in_sentence = copied_expr.split(' ');
  const numbers = words_in_sentence.filter((elemento) => /\d/.test(elemento));

  const filtered_words = words_in_sentence.filter(
    (elemento) =>
      !/\d/.test(elemento) &&
      elemento !== '' &&
      elemento !== '(' &&
      elemento !== ')' &&
      elemento !== 'and' &&
      elemento !== 'or' &&
      elemento !== '[' &&
      elemento !== ']'
  );

  let i = 0;
  filtered_words.forEach((word) => {
    if (special_words.includes(word)) {
      const new_string = generateCompleteString(word, numbers[i]);
      copied_expr = copied_expr.replace(numbers[i], '');
      copied_expr = copied_expr.replace(word, new_string);
    }
    i++;
  });
  return copied_expr;
}

export function generateBoolMatrix(expr) {
  const measures = store.getState().main.measures;
  const variable_names = measures.map((measure) => measure.acronim);

  if (!(verifyBrackets(expr) && verifySpaces(expr) && verifyNumbers(expr))) {
    throw new Error('Expression bad formed');
  }

  const complete_expr = getCompleteExpr(expr);

  console.log('EXPR: ' + complete_expr);

  const matrices = getFilteringMatrices(complete_expr);

  const bool_matrix = getFilteringMatrix(matrices, complete_expr);

  return bool_matrix;
}
