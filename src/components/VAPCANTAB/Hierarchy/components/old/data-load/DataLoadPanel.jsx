import { useState } from "react";
import DataLoadForm from "./DataLoadForm";
import MetaLoadForm from "./MetaLoadForm";

const DataLoadPanel = () => {
    const [tab, setTab] = useState("data");

    return (
        <div id="hier-editor" className="w-full relative mt-14 p-5">
            <div className="border-violet-600 border border-solid rounded-lg w-full h-full p-4 flex flex-col">
                <h2 className="text-2xl text-violet-700 font-semibold">
                    Carga de Conjunto de Datos y Metadatos.
                </h2>
                <div className="flex mt-4 gap-[0.375rem] items-center ">
                    <button
                        className={`${
                            tab === "data"
                                ? "bg-slate-600 text-white"
                                : "bg-slate-300 text-black"
                        } rounded-t-md text-center px-6 py-3`}
                        onClick={() => setTab("data")}
                    >
                        Conjuntos de Datos
                    </button>
                    <button
                        className={`${
                            tab === "meta"
                                ? "bg-slate-600 text-white"
                                : "bg-slate-300 text-black"
                        } rounded-t-md text-center px-6 py-3`}
                        onClick={() => setTab("meta")}
                    >
                        Descriptores y Metadatos
                    </button>
                </div>
                <div className="flex grow border border-solid border-slate-600 mb-4 rounded-lg rounded-tl-none bg-zinc-100 ">
                    {tab === 'data' && <DataLoadForm></DataLoadForm>}
                    {tab === 'meta' && <MetaLoadForm></MetaLoadForm>}
                </div>
            </div>
        </div>
    );
};

export default DataLoadPanel;
