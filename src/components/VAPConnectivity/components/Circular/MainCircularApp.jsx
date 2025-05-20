import store from '@/components/VAPUtils/features/store';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import CircularApp from './CircularApp';

export const MainCircularApp = () => {
  return (
    <Provider store={store}>
      <CircularApp title={'WP5 Tools - Circular'} />
    </Provider>
  );
};

export default MainCircularApp;
