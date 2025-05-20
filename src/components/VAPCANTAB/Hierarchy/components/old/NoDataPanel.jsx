import { pubsub } from "../pubsub";

const NoDataPanel = () => {
    const { publish } = pubsub
    return (
        <div
            id="hier-editor"
            className="w-full relative mt-14 p-5 flex flex-col items-center justify-center"
        >
            <p className="text-center text-4xl text-gray-500">
                No se han cargado archivos de datos.
            </p>
            <p className="text-center text-3xl text-gray-500">
                Usa el menu de
                <span
                    className="font-bold text-violet-800 mx-1 cursor-pointer"
                    onClick={() =>
                        publish("changePanelEvent", { tab: "data-load" })
                    }
                >
                    Carga de Datos
                </span>
                para poder comenzar el análisis
            </p>
        </div>
    );
};

export default NoDataPanel;
