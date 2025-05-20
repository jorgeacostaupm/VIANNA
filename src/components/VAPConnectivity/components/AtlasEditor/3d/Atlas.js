import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import store from '@/components/VAPUtils/features/store';
import { short_intense_colors } from './palettes';
import DataManager from '../../../managers/DataManager';
import { EVENTS } from '@/components/VAPUtils/Constants';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const BACKGROUND_COLOR = 'white';
const ROIS_GEOMETRY = 'BufferGeometry';
const MIN_OPACITY = 0.1;
const MAX_OPACITY = 1;

const utils = DataManager.getInstance();

export class Atlas {
  constructor(parent, channel, data) {
    this.parent = parent;

    this.num_clicks = 0;
    this.single_click_timer;

    this.sources = [];
    this.rois = [];
    this.camera_position = [0, 0, 1];
    this.data = data;

    const ratio = this.parent.clientWidth / this.parent.clientHeight;

    this.camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);
    this.mouse = new THREE.Vector2();
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer();
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(...[0, 0, 0]);

    this.camera.position.set(...this.camera_position);
    this.scene.add(this.camera);

    this.camera.add(this.light);

    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.renderer.setSize(this.parent.clientWidth, this.parent.clientHeight);
    this.parent.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.parent.addEventListener('mousemove', this.getMousePosition.bind(this));

    //window.addEventListener('resize', this.onWindowResize.bind(this));

    this.channel = new BroadcastChannel(channel);

    this.configureCoordination();
    this.updateAtlas();
    this.animate();
  }

  showLinksAndNodes(links) {
    this.showRois(links);
    this.showLinks(links);
  }

  configureCoordination() {
    const atlas = this;
    this.channel.onmessage = function (event) {
      const message = event.data;
      switch (message.type) {
        case EVENTS.SHOW_LINKS_IN_ATLAS:
          const links = message.data.links;
          atlas.showRois(links);
          atlas.showLinks(links);
          break;
        case EVENTS.RESET_ATLAS:
          atlas.showAllRois();
      }
    };
  }

  showLinks(links) {
    this.removeLinks();
    links.forEach((link) => {
      const rois = this.scene.children.filter((child) =>
        [link.x_node, link.y_node].includes(child.userData.acronim)
      );
      console.log('ROIS', rois, link);
      if (rois.length > 1) this.addLink(rois[0].userData.center, rois[1].userData.center);
    });

    console.log('finish');
  }

  addLink(start, end) {
    console.log(start, end);
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const cylinder_geometry = new THREE.CylinderGeometry(0.01, 0.01, length, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const cylinder = new THREE.Mesh(cylinder_geometry, material);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    console.log(midpoint);

    cylinder.position.copy(midpoint);
    cylinder.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    cylinder.link = true;
    this.scene.add(cylinder);
  }

  removeLinks() {
    this.scene.children = this.scene.children.filter((child) => {
      if (child.link) {
        this.scene.remove(child);
        return false;
      }
      return true;
    });
  }

  showRois(links) {
    const unique_rois = [...new Set(links.flatMap((link) => [link.x_node, link.y_node]))];
    this.showRoisById(unique_rois);
  }

  showRoisById(ids) {
    if (this.data.base === 'elc-127') this.showElectrodesByIds(ids);
    else if (this.data.base === 'aal-90') this.showROIsByIds(ids);
  }

  showROIsByIds(ids) {
    this.scene.children.forEach((p) => {
      if (p.isMesh && p.geometry.type === ROIS_GEOMETRY) {
        const roi = p.userData;
        const color = new THREE.MeshStandardMaterial({
          color: short_intense_colors[roi.id],
          transparent: ids.includes(roi.acronim) ? false : true,
          opacity: ids.includes(roi.acronim) ? MAX_OPACITY : MIN_OPACITY
        });
        p.material.dispose();
        p.material = color;
      }
    });
  }

  showElectrodesByIds(ids) {
    this.scene.children.forEach((p) => {
      if (p.isMesh) {
        const roi = p.userData;
        const color = new THREE.MeshStandardMaterial({
          color: 'blue',
          transparent: ids.includes(roi.acronim) ? false : true,
          opacity: ids.includes(roi.acronim) ? MAX_OPACITY : MIN_OPACITY
        });
        p.material.dispose();
        p.material = color;
      }
    });
  }

  showAllRois() {
    this.removeLinks();
    this.showRoisById(store.getState().atlas.selected_ids);
  }

  showConnection(link) {
    const ids = [link.x_node, link.y_node];
    this.showRoisById(ids);
    const link_arr = [link];
    this.showLinks(link_arr);
  }

  setBestCameraPosition(link) {
    const base_atlas = utils.getBaseAtlas();
    const rois = base_atlas.rois
      .filter((roi) => [link.x_index, link.y_index].includes(roi.id))
      .map((roi) => roi.position);

    const midpoint = new THREE.Vector3()
      .addVectors(new THREE.Vector3().fromArray(rois[0]), new THREE.Vector3().fromArray(rois[1]))
      .multiplyScalar(0.5);
    const position = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), midpoint)
      .normalize();

    this.camera.position.copy(position);
    this.camera.lookAt(0, 0, 0);
  }

  getCylinder(length) {
    const radius = 0.01;
    const segments = 8;
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, length, segments);
    return cylinderGeometry;
  }

  showAllRois() {
    this.removeLinks();
    const selected_ids = store.getState().atlas.selected_ids;
    this.showRoisById(selected_ids);
  }

  cleanScene() {
    this.scene.children = this.scene.children.filter((child) => {
      if (child.isMesh) {
        this.removeObject3D(child);
        return false;
      }
      return true;
    });
  }

  removeObject3D(object3D) {
    if (!(object3D instanceof THREE.Object3D)) return false;

    if (object3D.geometry) object3D.geometry.dispose();
    if (object3D.material) {
      if (Array.isArray(object3D.material)) {
        object3D.material.forEach((material) => material.dispose());
      } else {
        object3D.material.dispose();
      }
    }
    object3D.removeFromParent();
    return true;
  }

  updateAtlas() {
    if (this.data.base === 'elc-127') this.renderElectrodes();
    else if (this.data.base === 'aal-90') this.renderAAL90();
  }

  renderAAL90() {
    const order = store.getState().atlas.matrix_order;
    this.camera.position.set(...[0, 0, 1]);
    console.log(order);

    this.data.rois.forEach((roi) => {
      const points = roi.mesh_points.map(
        (point) => new THREE.Vector3(point[0], point[2], point[1])
      );
      const center = this.computeCenter(points);
      const shape = new ConvexGeometry(points);

      const color = new THREE.MeshStandardMaterial({
        color: short_intense_colors[roi.id],
        transparent: true,
        opacity: order ? (order.includes(roi.label) ? 1 : 0.5) : 1
      });

      const mesh = new THREE.Mesh(shape, color);
      mesh.scale.set(1, 1, 1);
      mesh.userData = {
        id: roi.id,
        title: roi.title,
        acronim: roi.acronim,
        label: roi.label,
        center: center
      };
      this.scene.add(mesh);
    });
  }

  renderElectrodes() {
    const multiplier = 10;
    const order = store.getState().atlas.matrix_order;
    this.camera.position.set(...[0, 0, 3]);

    this.renderElectrodesHeadModel();

    this.data.rois.forEach((roi) => {
      const positionArray = roi.mesh_points.map((e) => e * multiplier);
      const position = new THREE.Vector3(
        positionArray[0],
        positionArray[2] + 0.5,
        positionArray[1]
      );

      const geometry = new THREE.SphereGeometry(0.05, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 'blue',
        transparent: true,
        opacity: order ? (order.includes(roi.label) ? 1 : 0.5) : 1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      mesh.userData = {
        title: roi.title,
        acronim: roi.acronim,
        label: roi.label,
        center: position
        // more data
      };
      this.scene.add(mesh);
    });
  }

  renderElectrodesHeadModel() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffb052,
      transparent: true,
      opacity: 0.8
    });

    const objLoader = new OBJLoader();
    objLoader.load(
      '/vis/3d_models/free_head.obj',
      (object) => {
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = material;
          }
        });
        object.scale.set(10, 10, 9);
        object.position.y = -16.4;
        object.position.x = 0;
        object.position.z = -0.5;
        this.scene.add(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
      },
      (error) => {
        console.error('Error al cargar el modelo .obj', error);
      }
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  getMousePosition(event) {
    const rect = this.parent.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.parent.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.parent.clientHeight) * 2 + 1;
  }

  computeCenter(points) {
    const center = new THREE.Vector3();
    points.forEach((point) => center.add(point));
    return center.multiplyScalar(1 / points.length);
  }

  onResize() {
    console.log('RESIZING ATLAS...');
    this.camera.aspect = this.parent.clientWidth / this.parent.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.parent.clientWidth, this.parent.clientHeight);
  }

  clickAction() {
    console.log('click!');
  }

  doubleClickAction() {
    console.log('double click!');
  }

  rightClickAction() {
    console.log('right click!');
  }

  handleClick() {
    this.num_clicks++;
    if (this.num_clicks === 1) {
      this.single_click_timer = setTimeout(() => {
        this.num_clicks = 0;
        this.clickAction();
      }, 200);
    } else if (this.num_clicks === 2) {
      clearTimeout(this.single_click_timer);
      this.num_clicks = 0;
      this.doubleClickAction();
    }
  }
}
