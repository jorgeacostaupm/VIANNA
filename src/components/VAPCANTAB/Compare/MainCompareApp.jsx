import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import ComparisonApp from './ComparisonApp';
import store from '@/components/VAPUtils/features/store.js';
import { initStateWithPrevTab } from 'redux-state-sync';

export const MainCompareApp = () => {
  return (
    <Provider store={store}>
      <ComparisonApp />
    </Provider>
  );
};

export default MainCompareApp;
