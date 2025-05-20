import store from '@/components/VAPUtils/features/store';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import ListApp from './ListApp';

export const MainListApp = () => {
  return (
    <Provider store={store}>
      <ListApp title={'WP5 Tools - Link Lists'} />
    </Provider>
  );
};

export default MainListApp;
