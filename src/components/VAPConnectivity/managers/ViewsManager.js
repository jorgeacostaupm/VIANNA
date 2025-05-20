import { setVisAttr, setFilterAttr } from '@/components/VAPUtils/features/circular/circularSlice';

import { setData } from '@/components/VAPUtils/features/main/mainSlice';
import { setLinks, addLink } from '@/components/VAPUtils/features/list/listSlice';
import store from '@/components/VAPUtils/features/store';
import DataManager from './DataManager';
import { updateAtlas } from '@/components/VAPUtils/features/atlas/atlasSlice';
import MatrixManager from '../components/Matrix/MatrixManager';
import CircularManager from '../components/Circular/CircularManager';
import { aux_aal } from '../data/aux_aal';
import { setInit as setInitMatrix } from '@/components/VAPUtils/features/matrix/matrixSlice';

const utils = DataManager.getInstance();

export class ViewsManager {
  constructor() {
    this.matrix_manager = MatrixManager.getInstance();
    this.circular_manager = CircularManager.getInstance();
  }

  getAtlasChannel() {
    return utils.getAtlasChannel();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ViewsManager();
    }
    return this.instance;
  }

  async setData(data) {
    const types = data.types;
    const measures = data.measures;
    const diff_measures = data.diff_measures;
    const populations = data.populations;
    const bands = [...data.bands, ...data.statistics];
    const original_bands = data.bands;
    const matrices = data.matrices;
    const statistics = data.statistics;
    const atlas = data.atlas;

    const base = data.base;
    const matrix_order = data.matrix_order;

    const atlas_payload = { base, matrix_order };

    const payload = {
      matrices,
      bands,
      original_bands,
      statistics,
      measures,
      diff_measures,
      types,
      populations,
      atlas
    };

    store.dispatch(setData(payload));
    store.dispatch(setInitMatrix(false));
    store.dispatch(updateAtlas(atlas_payload));

    console.log('FINISH INITIALIZATION...');
  }

  // -------------------- ATLAS -------------------- //

  async readBaseAtlas(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching JSON:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  }

  // -------------------- LIST/LINKS -------------------- //

  addLink(link) {
    const formatted_link = utils.getLinkData(link);
    store.dispatch(addLink(formatted_link));
  }

  removeLink(link) {
    const links = store.getState().list.links;
    const new_links = links.filter((l) => l.x_area != link.x_area || l.y_area != link.y_area);
    store.dispatch(setLinks(new_links));
  }

  getLinkByBand(study_matrix, control_matrix, diff_matrix, x, y) {
    if (y < x) {
      [x, y] = [y, x];
    }

    const z_value = diff_matrix[x][y];

    const mean_value_1 = study_matrix[x][y];
    const std_value_1 = study_matrix[x][y];

    const mean_value_2 = control_matrix[x][y];
    const std_value_2 = control_matrix[x][y];

    return { z_value, mean_value_1, std_value_1, mean_value_2, std_value_2 };
  }

  // -------------------- CIRCULAR -------------------- //

  /* initCircular() {
    const attr = utils.getInitAttr();

    store.dispatch(setVisAttr(attr));
    store.dispatch(setFilterAttr(attr));
    console.log('CIRCULAR Initialized...');
  } */

  updateD3Circular(circular, band) {
    const data = this.getD3CircularData(band);
    circular.band = data.band;
    circular.data = data;
    circular.updateVis();
  }

  getD3CircularData(band) {
    const { is_filter, vis_attr, filter_attr, is_fixed, filter_value } = store.getState().circular;
    const matrix = utils.getCommonFilteredMatrix(vis_attr, band);
    const orders = utils.getSelectedOrders();

    if (is_filter) {
      utils.applyFiltering(matrix, orders, filter_attr, filter_value, is_fixed);
    }

    console.log('MATRIX', matrix, 'ORDERS', orders, is_fixed);

    const data = this.generateD3CircularData(matrix, orders, band);
    return data;
  }

  generateD3CircularData(matrix, orders, band) {
    const base_atlas = utils.getBaseAtlas();
    const selected_atlas = store.getState().atlas.selected_atlas;

    const rois = store.getState().circular.is_complete
      ? base_atlas.rois
      : selected_atlas.rois.filter((roi) => orders.includes(roi.order));

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
      ];

      if (hemisphere == 'left') lobules_presented.reverse();

      return lobules_presented.map((region) => ({
        name: region,
        children:
          hemisphere == 'left'
            ? generateROIChildren(region, hemisphere)
            : generateROIChildren(region, hemisphere).reverse()
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
            links: orders.indexOf(roi.order) != -1 ? generateLinks(orders.indexOf(roi.order)) : []
          };
        });

      return children;
    }

    function generateLinks(index) {
      const links = [];
      for (let j = index + 1; j < orders.length; j++) {
        if (matrix[index][j] != 0) {
          links.push({
            name: rois.find((roi) => roi.order == orders[j]).acronim,
            value: matrix[index][j]
          });
        }
      }
      return links;
    }

    const radial_data = generateRadialData();

    return radial_data;
  }

  // -------------------- CIRCULAR -------------------- //

  initCircular() {
    this.circular_manager.init();
  }

  updateCircular(circular, attr = null) {
    this.circular_manager.update(circular, attr);
  }

  getCircularChannel() {
    return this.circular_manager.channel;
  }

  // -------------------- MATRIX -------------------- //

  initMatrix() {
    this.matrix_manager.init();
  }

  updateMatrix(matrix, attr = null) {
    this.matrix_manager.update(matrix, attr);
  }

  getMatrixChannel() {
    return this.matrix_manager.channel;
  }
}

export default ViewsManager;
