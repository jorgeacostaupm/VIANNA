import store from '@/components/VAPUtils/features/store';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import { MultiMatrix } from './Menu/MultiMatrix';

export const MainMatrixApp = () => {
  return (
    <Provider store={store}>
      <MultiMatrix />
    </Provider>
  );
};

export default MainMatrixApp;
