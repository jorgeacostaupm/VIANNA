import store from '@/components/VAPUtils/features/store.js';
import { Provider } from 'react-redux';
import '@/components/VAPCANTAB/vis.css';
import EvolutionApp from './EvolutionApp';

export const MainEvolutionApp = () => {
  return (
    <Provider store={store}>
      <EvolutionApp />
    </Provider>
  );
};

export default MainEvolutionApp;
