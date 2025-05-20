import { useState } from "react";
import DSVMetaFormModal from "./meta-modals/DSVMetaFormModal";
import ExcelMetaFormModal from "./meta-modals/ExcelMetaFormModal";

import { unimplemented } from "../../utils";

const MetaLoadForm = () => {
    const [modalPanel, changeModal] = useState('');
    // if (modalPanel == 'excel') {
    //     unimplemented()()
    // }
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
        </div>

        { modalPanel === 'dsv' && <DSVMetaFormModal setSource={changeModal} /> }
        { modalPanel === 'excel' && <ExcelMetaFormModal setSource={changeModal} /> }

        </>

    )
}

export default MetaLoadForm;
