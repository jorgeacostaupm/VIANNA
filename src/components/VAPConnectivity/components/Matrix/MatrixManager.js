import DataManager from '../../managers/DataManager';
import ViewManager from '../../interfaces/ViewManager';
import store from '@/components/VAPUtils/features/store';
import { setVisAttr, setFilterAttr, setReorderAttr } from '@/components/VAPUtils/features/matrix/matrixSlice';

const utils = DataManager.getInstance();

class MatrixManager extends ViewManager {
  constructor() {
    super();
    this.channel = new BroadcastChannel('matrix');
    this.common_delete = null;
    this.simultaneous_counter = 0;
  }

  init() {
    const attr = utils.getInitAttr();
    store.dispatch(setVisAttr(attr));
    store.dispatch(setFilterAttr(attr));
    store.dispatch(setReorderAttr(attr));
    console.log('MATRIX INIT...');
  }

  update(matrix, attr = null) {
    const data = this.getData(attr);
    matrix.initData(data);
    matrix.updateVis();
  }

  getData(attr = null) {
    const {
      is_filter,
      is_vis_filter,
      is_reorder,
      is_vis_reorder,
      filter_attr,
      reorder_attr,
      filter_value,
      algorithm,
      multi_attrs,
      specialFilterValues
    } = store.getState().matrix;

    // obtain matrix and orders cleaned
    let [matrix, order] = utils.getOrderAndMatrix(attr);

    let delete_positions = null;
    if (algorithm === 'simultaneous' && is_vis_filter) {
      delete_positions = utils.getCommonDeletePositions(filter_value);
    } else if (is_filter) {
      delete_positions = utils.applyFiltering(filter_attr, filter_value);
    } else if (is_vis_filter) {
      let acronim;
      if (attr.type.acronim === 'zscore') {
        acronim = 'zscore';
      } else {
        acronim = attr.measure.acronim;
      }
      let value = specialFilterValues[acronim];
      if (!value) value = 0;
      delete_positions = utils.applyFiltering(attr, value);
    }

    if (delete_positions != null) {
      utils.deleteMatrixPositions(matrix, delete_positions);
      utils.deleteArrayPositions(order, delete_positions);
    }

    if (this.isMatrix(matrix)) {
      if (algorithm === 'simultaneous') {
        this.simultaneous_counter++;
        const permutation = utils.getCommonPermutation();
        utils.permute(matrix, order, permutation);
      } else if (is_reorder || is_vis_reorder) {
        let [matrix2Reorder, _] = utils.getOrderAndMatrix(is_vis_reorder ? attr : reorder_attr);
        if (delete_positions != null) utils.deleteMatrixPositions(matrix2Reorder, delete_positions);

        const permutation = utils.getPermutation(matrix2Reorder, order);
        utils.permute(matrix, order, permutation);
      }
    }

    if (this.simultaneous_counter === multi_attrs.length) {
      utils.common_order = null;
      utils.common_delete_positions = null;
      this.simultaneous_counter = 0;
    }

    const data = this.generateViewData(matrix, order, attr);
    return data;
  }

  isMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      return false;
    }

    if (!matrix.every((row) => Array.isArray(row) && row.length > 0)) {
      return false;
    }

    const rowLength = matrix[0].length;
    if (!matrix.every((row) => row.length === rowLength)) {
      return false;
    }

    if (rowLength === 1) return false;

    return true;
  }

  getCommonFilterIndices() {
    const rois = store.getState().atlas.selected_atlas.rois;
    const selected_ids = store.getState().atlas.selected_ids;

    const indices = rois
      .filter((roi) => !selected_ids.includes(roi.acronim))
      .map((roi) => roi.order);

    return indices;
  }

  generateViewData(matrix, orders, attr) {
    const { vis_attr, filter_value } = store.getState().matrix;
    const links = [];
    let max = Number.MIN_SAFE_INTEGER;
    let min = Number.MAX_SAFE_INTEGER;

    const base_atlas = store.getState().atlas.atlas_3d;
    const selected_ids = store.getState().atlas.selected_ids;
    const order = store.getState().atlas.matrix_order;
    const rois = base_atlas.rois.filter(
      (roi) => selected_ids.includes(roi.label) && order.includes(roi.label)
    );

    console.log(rois, matrix, orders);

    let gen_attr = attr != null ? attr : vis_attr;
    gen_attr = utils.getCopy(gen_attr);
    const matrices = utils.getMatricesByAttr(gen_attr);

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix.length; j++) {
        let value = matrix[i][j];
        if (value != 0) {
          const x_area = rois.find((roi) => order.indexOf(roi.acronim) === orders[i]).acronim;
          const y_area = rois.find((roi) => order.indexOf(roi.acronim) === orders[j]).acronim;

          let x = orders[i];
          let y = orders[j];

          if (x > y) [x, y] = [y, x];

          links.push({
            x_node: x_area,
            y_node: y_area,
            value: value,
            z_value: matrices?.zscore ? matrices.zscore[x][y] : undefined,
            mean_1: matrices?.mean_1 ? matrices.mean_1[x][y] : undefined,
            std_1: matrices?.std_1.length > 0 ? matrices.std_1[x][y] : undefined,
            mean_2: matrices?.mean_2 ? matrices.mean_2[x][y] : undefined,
            std_2: matrices?.std_2?.length > 0 ? matrices.std_2[x][y] : undefined,
            x_index: x,
            y_index: y
          });

          // Update max and min values
          if (value > max) {
            max = value;
          }
          if (value < min) {
            min = value;
          }
        }
      }
    }
    const nodes = orders.map((o) => {
      return rois.find((roi) => order.indexOf(roi.acronim) === o);
    });

    return {
      links,
      max,
      min,
      nodes,
      attr: utils.getAttrKey(attr),
      atlas: 'AAL'
    };
  }
}

export default MatrixManager;
