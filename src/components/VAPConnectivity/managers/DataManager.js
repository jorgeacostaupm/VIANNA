import store from '@/components/VAPUtils/features/store';
import * as d3 from 'd3';

const SPECIAL_TYPES = ['mean', 'max', 'min'];

export class DataManager {
  constructor() {
    this.atlas_channel = new BroadcastChannel('atlas');
  }

  getAtlasChannel() {
    return this.atlas_channel;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DataManager();
    }
    return this.instance;
  }

  getNodeLobuleColors() {
    const base_atlas = this.getBaseAtlas();
    const lobule_names = Array.from(new Set(base_atlas.rois.map((roi) => roi.lobule)));
    const colors = ['#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf'];

    const lobuleColors = lobule_names.reduce((acc, lobule, index) => {
      acc[lobule] = colors[index % colors.length];
      return acc;
    }, {});

    // Paso 3: Crea un diccionario que relacione cada acronim con su color
    const acronymColorMap = base_atlas.rois.reduce((acc, item) => {
      acc[item.acronim] = lobuleColors[item.lobule];
      return acc;
    }, {});

    return acronymColorMap;
  }

  getNodeToName() {
    const base_atlas = this.getBaseAtlas();
    const acronym_to_name_map = base_atlas.rois.reduce((acc, item) => {
      acc[item.acronim] = item.title;
      return acc;
    }, {});

    return acronym_to_name_map;
  }

  filterMatrix(originalMatrix, booleanMatrix) {
    const result = [];
    for (let i = 0; i < originalMatrix.length; i++) {
      const resultRow = [];
      for (let j = 0; j < originalMatrix[i].length; j++) {
        if (booleanMatrix[i][j]) {
          resultRow.push(originalMatrix[i][j]);
        } else {
          resultRow.push(0);
        }
      }
      result.push(resultRow);
    }

    return result;
  }

  getAttrKey(attr) {
    return attr.type.acronim + attr.measure.acronim + attr.band.acronim;
  }

  generateAttrFromWord(word) {
    const words = word.split('-');
    const attr = { type: {}, measure: {}, band: {} };
    attr.type.acronim = words[0];
    attr.measure.acronim = words[1];
    attr.band.acronim = words[2];
    return attr;
  }

  compareAttrs(attr1, attr2) {
    const condition =
      attr1.type.acronim === attr2.type.acronim &&
      attr1.measure.acronim === attr2.measure.acronim &&
      attr1.band.acronim === attr2.band.acronim;
    return condition;
  }

  permute(matrix, array, permutation) {
    this.permuteMatrix(matrix, permutation);
    this.permuteArray(array, permutation);
  }

  setDiagonalToZero(matrix) {
    // Verifica que la matriz sea cuadrada
    if (matrix.length !== matrix[0].length) {
      console.error('La matriz no es cuadrada.');
      return;
    }

    for (let i = 0; i < matrix.length; i++) {
      matrix[i][i] = 0;
    }
  }

  getOrder() {
    const rois = store.getState().atlas.selected_atlas.rois;
    const selected_ids = store.getState().atlas.selected_ids;
    const matrix_order = store.getState().atlas.matrix_order;
    const order = rois
      .filter((roi) => selected_ids.includes(roi.acronim) && matrix_order.includes(roi.acronim))
      .map((roi) => matrix_order.indexOf(roi.acronim))
      .sort((a, b) => a - b);

    return order;
  }

  getOrderAndMatrix(attr) {
    let matrix = this.getMatrixProp(attr, 'mean');
    const isDiagonal = store.getState().matrix.diagonal;
    if (!isDiagonal) this.setDiagonalToZero(matrix);

    const { filtering_expr: main_filtering_expr } = store.getState().main;
    if (main_filtering_expr != '') {
      const bool_matrix = store.getState().main.bool_matrix;
      matrix = this.filterMatrix(matrix, bool_matrix);
    }

    const { filtering_expr: matrix_filtering_expr } = store.getState().matrix;
    if (matrix_filtering_expr != '') {
      const bool_matrix = store.getState().matrix.bool_matrix;
      matrix = this.filterMatrix(matrix, bool_matrix);
    }

    const order = this.getOrder();

    return [matrix, order];
  }

  applyFiltering(attr, value) {
    const [matrix2Filter, _] = this.getOrderAndMatrix(attr);
    const delete_positions = this.getPositions2Filter(matrix2Filter, value);
    return delete_positions;
  }

  getCopy(item) {
    const copied_item = JSON.parse(JSON.stringify(item));
    return copied_item;
  }

  getMainProp(key) {
    const prop = store.getState().main[key];
    return prop;
  }

  getInitAttr() {
    const type = this.getMainProp('types').filter((item) => item.active)[0];
    const measure = this.getMainProp('measures').filter((item) => item.active)[0];
    const band = this.getMainProp('bands').filter((item) => item.active)[0];

    return { type, measure, band };
  }

  getMenuItem(item) {
    const menu_item = {};
    menu_item.value = item.acronim;
    menu_item.label = item.name;
    menu_item.data = item;
    return menu_item;
  }

  getMenuItems(items) {
    const menu_items = items.filter((item) => item.active).map((item) => this.getMenuItem(item));
    return menu_items;
  }

  getBaseAtlas() {
    const selected_atlas = store.getState().atlas.selected_atlas;
    return selected_atlas;
  }

  getCommonFilterIndices() {
    const rois = store.getState().atlas.atlas_3d.rois;
    const selected_ids = store.getState().atlas.selected_ids;
    const order = store.getState().atlas.matrix_order;

    const indices = rois
      .filter((roi) => !selected_ids.includes(roi.label))
      .map((roi) => order.indexOf(roi.label));

    return indices;
  }

  getActiveProp(prop) {
    const active_props = store.getState().main[prop].filter((item) => item.active);
    return active_props;
  }

  getActiveMeasures() {
    const active_measures = store.getState().main.measures.filter((measure) => measure.active);
    return active_measures;
  }

  getActiveBands() {
    const active_bands = store.getState().main.bands.filter((band) => band.active);
    return active_bands;
  }

  getMatrixIndexByAcronim(acronim) {
    const selected_atlas = store.getState().atlas.selected_atlas;

    const order = selected_atlas.rois.find((roi) => roi.acronim == acronim).order;
    return order;
  }

  getAcronymOrderDictionary() {
    const selected_atlas = store.getState().atlas.selected_atlas;

    const acronymOrderDict = {};
    selected_atlas.rois.forEach((roi) => {
      acronymOrderDict[roi.acronim] = roi.order;
    });

    return acronymOrderDict;
  }

  getLinkByAttr(attr, x, y) {
    if (y < x) {
      [x, y] = [y, x];
    }

    const copy_attr = this.getCopy(attr);

    copy_attr.type.acronim = 'zscore';
    const z_value = this.getMeanMatrixValue(attr, x, y);

    copy_attr.type.acronim = 'study';
    const mean_value_1 = this.getMeanMatrixValue(attr, x, y);
    const std_value_1 = this.getStdMatrixValue(attr, x, y);

    copy_attr.type.acronim = 'control';
    const mean_value_2 = this.getMeanMatrixValue(attr, x, y);
    const std_value_2 = this.getStdMatrixValue(attr, x, y);

    return { z_value, mean_value_1, std_value_1, mean_value_2, std_value_2 };
  }

  generateTickTarget(e) {
    const target = {
      tag_name: e.target.tagName,
      axis: e.target.parentElement.parentElement.className.baseVal[0] + '_nodes',
      is_selected: d3.select(e.target.parentElement).classed('tick selectedNode'),
      roi_acronim: d3.select(e.target).data()[0]
    };

    return target;
  }

  generateMsg(type, data = null) {
    const msg = { type, data };
    return msg;
  }

  getLinkData(link) {
    const formatted_link = {};
    formatted_link.key = link.x_node + link.y_node;
    formatted_link.x_node = link.x_node;
    formatted_link.y_node = link.y_node;

    return formatted_link;
  }

  getSelectedOrders() {
    const rois = store.getState().atlas.selected_atlas.rois;
    const selected_ids = store.getState().atlas.selected_ids;
    const order = store.getState().atlas.matrix_order;
    const orders = rois
      .filter((roi) => selected_ids.includes(roi.label))
      .map((roi) => order.indexOf(roi.label))
      .sort((a, b) => a - b);

    return orders;
  }

  getMeanMatrixValueNoFilter(attr, x, y) {
    if (x > y) [x, y] = [y, x];
    const matrix = this.getMatrixPropNoFilter(attr, 'mean');
    return matrix[x][y];
  }

  getStdMatrixValueNoFilter(attr, x, y) {
    if (x > y) [x, y] = [y, x];
    const matrix = this.getMatrixPropNoFilter(attr, 'std');
    return matrix[x][y];
  }

  getMeanMatrixValue(attr, x, y) {
    const matrix = this.getMatrixProp(attr, 'mean');
    return matrix[x][y];
  }

  getStdMatrixValue(attr, x, y) {
    const matrix = this.getMatrixProp(attr, 'std');
    return matrix[x][y];
  }

  getMatrix(attr) {
    const type = attr.type.acronim;
    const measure = attr.measure.acronim;
    const band = attr.band.acronim;

    const matrix = store
      .getState()
      .main.matrices.find(
        (matrix) =>
          matrix.type_acronim == type &&
          matrix.measure_acronim == measure &&
          matrix.band_acronim == band
      );

    return matrix;
  }

  getMatricesByAttr(attr) {
    const obj = {};
    const types = store.getState().main.types;

    types.forEach((type) => {
      if (type.acronim == 'zscore') {
        attr.type.acronim = 'zscore';
        const zscore = this.getMatrixPropNoFilter(attr, 'mean');
        obj.zscore = zscore;
      }
      if (type.acronim == 'study') {
        attr.type.acronim = 'study';
        obj.mean_1 = this.getMatrixPropNoFilter(attr, 'mean');
        obj.std_1 = this.getMatrixPropNoFilter(attr, 'std');
      }
      if (type.acronim == 'control') {
        attr.type.acronim = 'control';
        obj.mean_2 = this.getMatrixPropNoFilter(attr, 'mean');
        obj.std_2 = this.getMatrixPropNoFilter(attr, 'std');
      }
    });

    return obj;
  }

  upperTriangularToSymmetric(matrix) {
    const numRows = matrix.length;
    const numCols = matrix.length;

    if (numRows !== numCols) {
      throw new Error('Input matrix must be square.');
    }

    const symmetricMatrix = Array.from({ length: numRows }, () => Array(numCols).fill(0));

    for (let i = 0; i < numRows; i++) {
      for (let j = i; j < numCols; j++) {
        symmetricMatrix[i][j] = matrix[i][j];
        symmetricMatrix[j][i] = matrix[i][j];
      }
    }

    return symmetricMatrix;
  }

  getMatrixPropNoFilter(attr, prop) {
    const attr_matrix = this.getMatrix(attr);
    return attr_matrix[prop];
  }

  getMatrixProp(attr, prop) {
    const attr_matrix = this.getMatrix(attr);
    const deep_copy_matrix = this.getCopy(attr_matrix[prop]);

    const indices = this.getCommonFilterIndices();
    this.deleteEmptyRowsCols(deep_copy_matrix, indices);

    const matrix = this.upperTriangularToSymmetric(deep_copy_matrix);
    return matrix;
  }

  deleteRows(matrix, indices) {
    indices.sort((a, b) => b - a);
    for (let i = 0; i < indices.length; i++) {
      matrix.splice(indices[i], 1);
    }
  }

  deleteColumns(matrix, indices) {
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = matrix[i].filter((_, colIndex) => !indices.includes(colIndex));
    }
  }

  deleteEmptyRowsCols(matrix, indices) {
    this.deleteColumns(matrix, indices);
    this.deleteRows(matrix, indices);
  }

  deleteMatrixPositions(matrix, delete_positions, is_fixed = false) {
    const cells_to_delete = delete_positions.cells;
    const rows_to_delete = delete_positions.rows;

    for (const cell of cells_to_delete) {
      matrix[cell.row][cell.col] = 0;
    }

    if (!is_fixed) this.deleteEmptyRowsCols(matrix, rows_to_delete);
  }

  deleteArrayPositions(array, delete_positions) {
    const rows_to_delete = delete_positions.rows;

    for (let i = 0; i < rows_to_delete.length; i++) {
      array.splice(rows_to_delete[i], 1);
    }
  }

  permuteMatrix(matrix, permutation) {
    const n = matrix.length;

    // Create a copy of the original matrix
    const originalMatrix = matrix.map((row) => [...row]);

    // Modify the input matrix based on the permutation
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        matrix[i][j] = originalMatrix[permutation[i]][permutation[j]];
      }
    }
  }

  permuteArray(arr, permutation) {
    const n = arr.length;
    const resultArray = new Array(n);

    for (let i = 0; i < n; i++) {
      resultArray[i] = arr[permutation[i]];
    }

    for (let i = 0; i < n; i++) {
      arr[i] = resultArray[i];
    }

    return resultArray;
  }

  getArrayPermutation(original_array, target_array) {
    const target_map = {};
    target_array.forEach((value, index) => {
      target_map[value] = index;
    });

    const sorted_indices = original_array.map((value) => target_map[value]);

    const original_indices = Array.from({ length: original_array.length }, (_, index) => index);

    const permutation = original_indices.sort((a, b) => sorted_indices[a] - sorted_indices[b]);

    return permutation;
  }

  getAnatomicalPerm(orders) {
    const rois = this.getCopy(this.getBaseAtlas().rois);

    const ordered_rois = rois
      .sort((a, b) => {
        if (a.hemisphere < b.hemisphere) return -1;
        if (a.hemisphere > b.hemisphere) return 1;

        if (a.lobule < b.lobule) return -1;
        if (a.lobule > b.lobule) return 1;
      })
      .filter((roi) => orders.includes(roi.order))
      .map((roi) => {
        return roi.order;
      });

    const permutation = this.getArrayPermutation(orders, ordered_rois);

    return permutation;
  }

  getPermutation(matrix, orders) {
    const state = store.getState().matrix;

    const algorithm = state.algorithm;
    matrix = this.upperTriangularToSymmetric(matrix);

    let perm;
    if (algorithm != 'anatomical') perm = this.getPermByAlgorithm(matrix, algorithm);
    else perm = this.getAnatomicalPerm(orders);

    return perm;
  }

  getPermByAlgorithm(matrix, algorithm) {
    const { distance, multi_attrs } = store.getState().matrix;

    let graph = reorder.mat2graph(matrix, false);
    let leafOrder = reorder.optimal_leaf_order().distance(reorder.distance[distance]);

    let order;

    switch (algorithm) {
      case 'pca':
        order = reorder.pca_order(matrix);
        return order;
      case 'spectral':
        order = reorder.spectral_order(graph);
        return order;
      case 'optimal_leaf':
        order = leafOrder(matrix);
        return order;
      case 'cuthill':
        order = reorder.cuthill_mckee_order(graph);
        return order;
      case 'rcm':
        order = reorder.reverse_cuthill_mckee_order(graph);
        return order;
      case 'optimal_leaf_distance':
        let dist_adjacency = reorder.graph2valuemats(graph);
        order = reorder.valuemats_reorder(dist_adjacency, leafOrder);
        return order;
      case 'anatomical':
        order = reorder.pca_order(matrix);
        return order;
      case 'simultaneous':
        if (this.common_order == null) {
          let matrices = multi_attrs.map((attr) => this.getMatrix(attr).mean);

          if (this.common_delete_positions)
            matrices.forEach((m) => {
              this.deletePositionsMatrix(m, this.common_delete_positions);
            });

          var dist_rows = reorder.dist(reorder.distance[distance])(matrices, false);
          this.common_order = reorder.optimal_leaf_order().distanceMatrix(dist_rows)(matrices[1]);
        }

        return this.common_order;
      default:
        console.log('Unknown algorithm...');
        return null;
    }
  }

  getCommonPermutation() {
    if (!this.common_order) {
      const { distance, multi_attrs } = store.getState().matrix;
      let matrices = multi_attrs.map((attr) => this.getMatrixProp(attr, 'mean'));

      if (this.common_delete_positions)
        matrices.forEach((m) => {
          this.deleteMatrixPositions(m, this.common_delete_positions);
        });

      var dist_rows = reorder.dist(reorder.distance[distance])(matrices, false);
      this.common_order = reorder.optimal_leaf_order().distanceMatrix(dist_rows)(matrices[1]);
    }

    return this.common_order;
  }

  getCommonDeletePositions(value) {
    if (!this.common_delete_positions) {
      const { multi_attrs } = store.getState().matrix;
      let matrices = multi_attrs.map((attr) => {
        let [matrix, _] = this.getOrderAndMatrix(attr);
        return matrix;
      });
      this.common_delete_positions = this.getMultipleDeletePositions(matrices, value);
    }
    return this.common_delete_positions;
  }

  getMultipleDeletePositions(matrices, value) {
    let jux_positions = [];
    matrices.forEach((m) => {
      let positions = this.getPositions2Filter(m, value);
      jux_positions.push(positions);
    });
    const delete_positions = this.findSharedCellsAndRows(jux_positions);
    return delete_positions;
  }

  findSharedCellsAndRows(arrayOfObjects) {
    // Find common rows
    let commonRows = arrayOfObjects[0].rows;

    for (let i = 1; i < arrayOfObjects.length; i++) {
      commonRows = commonRows.filter((row) => arrayOfObjects[i].rows.includes(row));
    }

    // Find common cells
    let commonCells = arrayOfObjects[0].cells;

    for (let i = 1; i < arrayOfObjects.length; i++) {
      const objectCells = arrayOfObjects[i].cells;
      commonCells = commonCells.filter((cell) =>
        objectCells.some((objCell) => objCell.row === cell.row && objCell.col === cell.col)
      );
    }

    return { cells: commonCells, rows: commonRows };
  }

  getPositions2Filter(matrix, value) {
    const cells = this.getCells2Delete(matrix, value);
    const rows = this.getRows2Delete(matrix, value);

    return {
      cells: cells,
      rows: rows
    };
  }

  getCells2Delete(matrix, value) {
    const transformedPositions = [];
    matrix.forEach((row, rowIndex) => {
      matrix[rowIndex] = row.map((cell, colIndex) => {
        if (Math.abs(cell) >= value) {
          return cell;
        } else {
          transformedPositions.push({ row: rowIndex, col: colIndex });
          return 0;
        }
      });
    });

    return transformedPositions;
  }

  getRows2Delete(matrix, value) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    const colsToDelete = [];
    for (let j = 0; j < numCols; j++) {
      let isColZero = true;
      for (let i = 0; i < numRows; i++) {
        if (Math.abs(matrix[j][i]) > value) {
          isColZero = false;
          break;
        }
      }
      if (isColZero) {
        colsToDelete.push(j);
      }
    }

    return colsToDelete.sort((a, b) => b - a);
  }
}

export default DataManager;
