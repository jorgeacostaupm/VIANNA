import store from '@/components/VAPUtils/features/store';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import AtlasApp from './AtlasApp';

export const MainAtlasApp = () => {
  return (
    <Provider store={store}>
      <AtlasApp title={'WP5 Tools - Atlas'} />
    </Provider>
  );
};

export default MainAtlasApp;
