import store from '@/components/VAPUtils/features/store.js';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import CorrelationApp from './CorrelationApp';

export const MainCorrelationApp = () => {
  return (
    <Provider store={store}>
      <CorrelationApp />
    </Provider>
  );
};

export default MainCorrelationApp;