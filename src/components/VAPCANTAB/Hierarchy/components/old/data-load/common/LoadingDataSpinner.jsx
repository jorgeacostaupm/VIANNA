
import { useSelector } from "react-redux";
import { useEffect } from "react";

import { ClipLoader } from "react-spinners";

const LoadingDataSpinner = ({ closeFn }) => {
    const loadingState = useSelector((state) => state.dataframe.loadedState);
    
    useEffect(() => {
        if (loadingState === 'done') {
            closeFn();
        }
    }, [loadingState])
    

    return ( 
    <div className="w-full h-full grow flex items-center justify-center flex-col">
        <ClipLoader
            loading={loadingState === 'loading'}
            color="#36d7b7"
            size={window.innerHeight * 0.4}
        />
        <h2 className="text-3xl font-bold text-center mt-5">Cargando Datos. Por favor, espere un momento</h2>
    </div> );
}
 
export default LoadingDataSpinner;