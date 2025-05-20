import { useState } from "react";
import DSVDataFormModal from "./data-modals/DSVDataFormModal";
import ExcelDataFormModal from "./data-modals/ExcelDataFormModal";

import { unimplemented } from "../../utils";

const DataLoadForm = () => {
    const [modalPanel, changeModal] = useState('');
    return (
        <>
            <div className="w-full grid grid-cols-[repeat(auto-fit,_350px)] h-fit mt-8 px-8 gap-8 max-h-[40%]">
            <button
                className="data-source-btn group"
                onClick={() => changeModal('dsv')}
            >
                <i className="fa-solid fa-file-csv text-4xl text-green-600 group-hover:scale-100"></i>
                <span className="text-xl text-black group-hover:underline group-hover:underline-offset-8 decoration-2">Archivo CSV / DSV</span>
            </button>
            <button
                className="data-source-btn group"
                onClick={() => changeModal('excel')}
            >
                <i className="fa-solid fa-file-excel text-4xl text-[#0f773f] group-hover:scale-100"></i>
                <span className="text-xl text-black group-hover:underline group-hover:underline-offset-8 decoration-2">Archivo Excel</span>
            </button>
            <button
                className="data-source-btn group"
                onClick={unimplemented()}
            >
                <i className="fa-solid fa-database text-4xl text-indigo-600 group-hover:scale-100"></i>
                <span className="text-xl text-black group-hover:underline group-hover:underline-offset-8 decoration-2">Base de Datos</span>
            </button>
            <button
                className="data-source-btn group"
                onClick={unimplemented()}
            >
                <span className="material-symbols-outlined text-5xl  text-yellow-600 group-hover:scale-100"> api </span>
                <span className="text-xl text-black group-hover:underline group-hover:underline-offset-8 decoration-2">API REST</span>
            </button>
        </div>

        { modalPanel === 'dsv' && <DSVDataFormModal setSource={changeModal} /> }
        { modalPanel === 'excel' && <ExcelDataFormModal setSource={changeModal} /> }
        { modalPanel === 'db' && <></> }
        { modalPanel === 'api' && <></> }

        </>

    )
}

export default DataLoadForm;
