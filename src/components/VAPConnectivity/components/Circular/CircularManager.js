import DataManager from '../../managers/DataManager';
import ViewManager from '../../interfaces/ViewManager';
import store from '@/components/VAPUtils/features/store';
import { setVisAttr, setFilterAttr } from '@/components/VAPUtils/features/circular/circularSlice';

const utils = DataManager.getInstance();

class CircularManager extends ViewManager {
  constructor() {
    super();
    this.channel = new BroadcastChannel('circular');
  }

  init() {
    const attr = utils.getInitAttr();
    store.dispatch(setVisAttr(attr));
    store.dispatch(setFilterAttr(attr));
    console.log('CIRCULAR INIT...');
  }

  update(circular, attr = null) {
    const data = this.getData(attr);
    circular.initData(data);
    circular.updateVis();
  }

  getData(attr = null) {
    const { is_filter, is_vis_filter, filter_attr, filter_value, is_fixed } =
      store.getState().circular;
    const { filtering_expr: main_filtering_expr } = store.getState().main;
    const { filtering_expr: matrix_filtering_expr } = store.getState().circular;

    let matrix = utils.getMatrixProp(attr, 'mean');

    if (main_filtering_expr != '') {
      const bool_matrix = store.getState().main.bool_matrix;
      matrix = utils.filterMatrix(matrix, bool_matrix);
    }

    if (matrix_filtering_expr != '') {
      const bool_matrix = store.getState().circular.bool_matrix;
      matrix = utils.filterMatrix(matrix, bool_matrix);
    }

    const atlas = store.getState().atlas.selected_atlas;
    const selected_ids = store.getState().atlas.selected_ids;
    const order = store.getState().atlas.matrix_order;
    const orders = atlas.rois
      .filter((roi) => selected_ids.includes(roi.acronim) && order.includes(roi.acronim))
      .map((roi) => order.indexOf(roi.acronim))
      .sort((a, b) => a - b);

    if (is_filter || is_vis_filter) {
      utils.applyFiltering(
        matrix,
        orders,
        is_vis_filter ? attr : filter_attr,
        filter_value,
        is_fixed
      );
    }

    const data =
      atlas.base === 'aal-90'
        ? this.generateViewData(matrix, orders)
        : this.generateViewDataNoHierarchy(matrix, orders);
    return data;
  }

  getCommonFilterIndices() {
    const rois = store.getState().atlas.selected_atlas.rois;
    const selected_ids = store.getState().atlas.selected_ids;

    const indices = rois
      .filter((roi) => !selected_ids.includes(roi.acronim))
      .map((roi) => roi.order);

    return indices;
  }

  moveFirstLeftHemisphereToFront(array) {
    let index = array.findIndex((obj) => obj.hemisphere === 'left');

    if (index !== -1 && index != 0) {
      let [obj] = array.splice(index, 1);
      array.unshift(obj);
    }
  }

  generateViewData(matrix, orders) {
    const base_atlas = store.getState().atlas.selected_atlas;
    const selected_ids = store.getState().atlas.selected_ids;
    const order = store.getState().atlas.matrix_order;
    const rois = base_atlas.rois.filter((roi) => selected_ids.includes(roi.acronim));

    this.moveFirstLeftHemisphereToFront(rois);

    function generateRadialData() {
      const hierarchical_rois = {
        name: 'graph',
        children: generateHemisphereChildren()
      };
      return hierarchical_rois;
    }

    function generateHemisphereChildren() {
      const hemispheres = [...new Set(rois.map((roi) => roi.hemisphere))];
      const children = hemispheres.reverse().map((hemisphere) => ({
        name: hemisphere,
        children: generateLobuleChildren(hemisphere)
      }));

      return children;
    }

    function generateLobuleChildren(hemisphere) {
      const lobules_presented = [
        ...new Set(rois.filter((roi) => roi.hemisphere == hemisphere).map((roi) => roi.lobule))
      ].sort();

      if (hemisphere == 'right') lobules_presented.reverse();

      return lobules_presented.map((region) => ({
        name: region,
        children: generateROIChildren(region, hemisphere)
      }));
    }

    function generateROIChildren(region, hemisphere) {
      let children = rois
        .filter((roi) => {
          return roi.lobule === region && roi.hemisphere === hemisphere;
        })
        .map((roi) => {
          return {
            name: roi.acronim,
            links: generateLinks(order.indexOf(roi.label))
          };
        });

      return children;
    }

    function generateLinks(index) {
      const links = [];
      for (let j = index + 1; j < orders.length; j++) {
        if (matrix[index][j] != 0) {
          links.push({
            name: rois.find((roi) => order.indexOf(roi.label) == orders[j]).acronim,
            value: matrix[index][j]
          });
        }
      }
      return links;
    }

    const radial_data = generateRadialData();
    return radial_data;
  }

  generateViewDataNoHierarchy(matrix, orders) {
    const base_atlas = store.getState().atlas.selected_atlas;
    const selected_ids = store.getState().atlas.selected_ids;
    const rois = base_atlas.rois.filter((roi) => selected_ids.includes(roi.acronim));
    const order = store.getState().atlas.matrix_order;
    console.log('orders', orders);

    // Función principal para generar los datos radiales
    function generateRadialData() {
      const hierarchical_rois = {
        name: 'graph',
        children: generateROIChildren()
      };
      return hierarchical_rois;
    }

    function generateROIChildren() {
      return rois.map((roi) => ({
        name: roi.acronim,
        links: order.indexOf(roi.label) != -1 ? generateLinks(order.indexOf(roi.label)) : []
      }));
    }

    function generateLinks(index) {
      const links = [];
      for (let j = index + 1; j < orders.length; j++) {
        if (matrix[index][j] != 0) {
          links.push({
            name: rois.find((roi) => order.indexOf(roi.label) == orders[j]).acronim,
            value: matrix[index][j]
          });
        }
      }
      return links;
    }

    const radial_data = generateRadialData();
    return radial_data;
  }
}

export default CircularManager;
