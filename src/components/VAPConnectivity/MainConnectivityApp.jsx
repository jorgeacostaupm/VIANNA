import { useEffect } from 'react';
import store from '@/components/VAPUtils/features/store';
import { Provider } from 'react-redux';
import '../VAPCANTAB/vis.css';
import ConnectivityApp from './components/Pages/ConnectivityApp';
import ConnectivityTabApp from './ConnectivityTabApp';

export const MainConnectivityApp = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Provider store={store}>
        <ConnectivityTabApp />
      </Provider>
    </div>
  );
};

export default MainConnectivityApp;
