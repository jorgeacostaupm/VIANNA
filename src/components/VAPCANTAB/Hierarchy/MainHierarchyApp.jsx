import store from '@/components/VAPUtils/features/store.js';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import HierarchyEditorApp from './editor/HierarchyEditorApp';
import { initStateWithPrevTab } from 'redux-state-sync';

export const MainHierarchyApp = () => {
  return (
    <Provider store={store}>
      <HierarchyEditorApp />
    </Provider>
  );
};

export default MainHierarchyApp;
