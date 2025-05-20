import { useState } from "react";
import { pubsub } from '../pubsub';

const SideBar = ({ tab, setTab }) => {
    const [sideOpen, toggleSideBar] = useState(false);
    const { subscribe } = pubsub;
    subscribe('changePanelEvent', ({ tab }) => setTab(tab) )
    subscribe('toggleSideBarEvent', ({}) => toggleSideBar(p => !p) )

    return (
        <div className={`absolute top-0 left-0 w-[300px] h-screen mt-14 z-[60] bg-zinc-50 border-t border-0 border-r px-4 py-3 border-t-white border-violet-900 border-solid ${sideOpen ? 'flex flex-col': 'hidden'} items-start` }>
            <section className="w-full flex flex-col gap-1">
                <h2 className="text-start text-lg border-b-2 py-2 border-violet-800 border-0 border-solid">Conjuntos de Datos</h2>
                <button 
                    className={`w-full hover:w-[95%] hover:bg-zinc-200 mt-1 rounded-lg py-1 pl-1 text-start text-lg hover:scale-110 hover:translate-x-[5%] ${tab === 'data-load' ? 'text-violet-600': 'text-violet-900'} hover:text-violet-600`}
                    onClick={() => {
                        setTab("data-load");
                        toggleSideBar(false)
                    }}
                >
                    Carga de Datos
                </button>
                <button 
                    className={`w-full hover:w-[95%] hover:bg-zinc-200 mt-1 rounded-lg py-1 pl-1  text-start text-lg hover:scale-110 hover:translate-x-[5%] ${tab === 'data-table' ? 'text-violet-600': 'text-violet-900'} hover:text-violet-600`}
                    onClick={() => {
                        setTab("data-table");
                        toggleSideBar(false)
                    }}
                >
                    Tabla de Datos
                </button>
            </section>
            <section className="w-full flex flex-col gap-1 mt-2">
                <h2 className="text-start text-lg border-b-2 py-2 border-violet-800 border-0 border-solid">Jerarquías de Atributos</h2>
                <button 
                    className={`w-full hover:w-[95%] hover:bg-zinc-200 mt-1 rounded-lg py-1 pl-1  text-start text-lg hover:scale-110 hover:translate-x-[5%] ${tab === 'hier-editor' ? 'text-violet-600': 'text-violet-900'} hover:text-violet-600`}
                    onClick={() => {
                        setTab("hier-editor");
                        toggleSideBar(false)
                    }}
                >
                    Editor de Agregaciones
                </button>
            </section>
            <section className="w-full flex flex-col gap-1 mt-2">
                <h2 className="text-start text-lg border-b-2 py-2 border-violet-800 border-0 border-solid">Visualización de Datos</h2>
                <button 
                    className={`w-full hover:w-[95%] hover:bg-zinc-200 mt-1 rounded-lg py-1 pl-1 text-start text-lg hover:scale-110 hover:translate-x-[5%] ${tab === 'vis-navio' ? 'text-violet-600': 'text-violet-900'} hover:text-violet-600`}
                    onClick={() => {
                        setTab("vis-navio");
                        toggleSideBar(false)
                    }}
                >
                    Visualización Global
                </button>
            </section>

        </div>
    );
};

export default SideBar;
