import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { selectDescriptions } from "@/components/VAPUtils/features/metadata/metaSelectors";
import { pubsub } from "../../pubsub";

import { not } from "arquero";
import NoDataPanel from "../NoDataPanel";

const Tooltip = ({ content, children }) => {
    const [desc, type, dtype] = content;
    const [showTooltip, setShowTooltip] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const width = window.innerWidth;
        const currentPos = ref.current?.getBoundingClientRect();

        // Move tooltip if positioned to the side
        if (currentPos) {
            if (currentPos.left < 0.2 * width) {
                ref.current.style.left = `${+100}px`;
            } else if (currentPos.right > 0.8 * width) {
                ref.current.style.left = `${-currentPos.width}px`;
            }
        }
    }, [ref.current]);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div
                    className="bg-zinc-50 border-2 border-black border-solid rounded-lg p-3 z-[13] top-[45px] left-[-10px] absolute grid grid-cols-2 w-max text-nowrap"
                    ref={ref}
                >
                    <span className="font-semibold text-start">
                        Tipo de Dato:
                    </span>
                    <span
                        className={`${
                            dtype === "string"
                                ? "text-green-500"
                                : dtype === "number"
                                ? "text-blue-500"
                                : dtype === "date"
                                ? "text-violet-500"
                                : "text-red-500"
                        } text-end`}
                    >
                        {dtype}
                    </span>

                    <span className=" font-semibold text-start">
                        Tipo de Atributo:
                    </span>
                    <span
                        className={`${
                            dtype === "attribute"
                                ? "text-green-500"
                                : "text-red-500"
                        } text-end`}
                    >
                        {type}
                    </span>
                </div>
            )}
        </div>
    );
};

// CHAT GPT created
function createFilterObject(allColumns, filteredColumns) {
    const filterObject = {};
    allColumns.forEach((column) => {
        filterObject[column] = !filteredColumns.includes(column);
    });
    return filterObject;
}

const FilterModal = ({ columns, filtered, setFilter, close }) => {

    const [search, setSearch] = useState("");
    const [used, setUsed] = useState(createFilterObject(columns, filtered));

    const saveClose = () => {
        let filterColumns = Object.keys(used).filter((k) => !used[k]);
        console.log("filtered columns", filterColumns);
        setFilter(filterColumns);
        close(false);
    };

    const filterCol = (e, col) => {
        setUsed( prev => {
            const newState = { ...prev };
            newState[col] = e.target.checked;
            return newState;
        });
    }

    return (
        <>
            <div
                className="absolute top-0 left-0 z-[20] w-screen h-screen bg-gray-500 opacity-[0.65]"
                onClick={() => saveClose()}
            />
            <div className="absolute top-0 left-0 w-[30rem] translate-x-[calc(50vw_-_50%)] translate-y-[5rem] bg-zinc-50 rounded-xl opacity-100 z-[20] p-5 flex flex-col">
                <h4 className="text-lg text-violet-600 font-semibold">
                    Filtro de Columnas
                </h4>
                <div className="flex mt-2 w-full">
                    <input
                        type="text"
                        name="search-col"
                        onChange={(e) =>
                            setSearch(e.target.value.toLowerCase())
                        }
                        className="peer order-2 w-full translate-x-[-1.5rem] z-[21] rounded-lg p-1 pl-[1.75rem] border-gray-300 border-solid border focus:border-gray-500 focus:outline-none"
                    />
                    <i className="order-1 fa-solid fa-filter text-xl text-stone-300 peer-focus:text-stone-500 self-center aspect-square z-[22]"></i>
                </div>
                <div className="flex max-h-[300px] h-full overflow-y-scroll flex-col gap-y-1 mt-3 pr-2">
                    {Object.keys(used)
                    .filter((m) => {
                        return m.toLocaleLowerCase().includes(search) && m.length > 0
                    })
                    .map(m => {
                        return (
                            <div key={m} className="flex gap-2">
                                <input type="checkbox" name={m} checked={used[m]} onChange={(e) => filterCol(e, m)} className="w-[18px] rounded-lg "/>
                                <label htmlFor={m} className="truncate" title={m}>{m}</label>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
};

const TableVisComponent = () => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    const [filterMode, toggleFilter] = useState(false);
    const [columns, filterColumns] = useState([]);
    const data = useSelector((state) =>{
        return state.dataframe.dataframe == null
            ? null
            : state.dataframe.dataframe
                  .slice(page * pageSize, (page + 1) * pageSize)
                  .select(not(columns))
}    );
    const desc = useSelector(selectDescriptions);

    const { publish } = pubsub;

    if (data == null) {
        return <NoDataPanel />;
    }

    const objs = data.objects();
    const attributes = data.columnNames();

    return (
        <div id="hier-editor" className="w-full relative mt-14 p-5">
            <div className="grid grid-cols-3">
                <button
                    className="items-start flex gap-2 item-center bg-transparent hover:bg-zinc-200 rounded-xl border-solid border border-transparent active:border-gray-500 w-fit pl-1 pr-3 py-1"
                    onClick={() => toggleFilter(true)}
                >
                    <i className="fa-solid fa-filter text-xl text-gray-500 self-center aspect-square"></i>
                    <span className="text-lg">Filtro Columnas</span>
                </button>
                <h2 className="text-center w-full font-bold text-2xl text-purple-800">
                    Tabla de Datos
                </h2>
            </div>
            <div className="h-[90%] w-full mt-4 overflow-auto mb-2 border-gray-500 rounded-xl border-2 border-solid">
                <table
                    className={`overflow-scroll border-collapse table-fixed ${
                        attributes.length <= 8 ? "w-full" : ""
                    }`}
                >
                    <thead className="font-bold">
                        <tr className="text-lg ">
                            {attributes.map((c, i) => {
                                return (
                                    <th
                                        key={`c-${i}`}
                                        className={`${
                                            attributes.length > 8
                                                ? "max-w-[12rem]"
                                                : `w-[${
                                                      (1 / attributes.length) *
                                                      100
                                                  }%]`
                                        } p-3 cursor-default sticky top-0 z-[11] bg-zinc-100 border-x border-solid border-gray-500`}
                                    >
                                        {desc[c] == null ? (
                                            <span className="text-nowrap truncate">
                                                {c}
                                            </span>
                                        ) : (
                                            <Tooltip content={desc[c]}>
                                                <span className="text-nowrap truncate">
                                                    {c}
                                                </span>
                                            </Tooltip>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="" id="preview-body">
                        {objs.map((r, i) => {
                            return (
                                <tr
                                    key={`${i}`}
                                    className="border-b border-0 border-solid border-gray-400"
                                >
                                    {attributes.map((c, j) => {
                                        return (
                                            <td
                                                className="py-1 px-2 text-center border-x border-solid border-gray-400 text-nowrap truncate max-w-[30rem]"
                                                key={`${i}-${j}`}
                                            >
                                                {String(r[c])}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-4 items-center mt-4 justify-center mb-auto">
                <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    className="bg-gray-200 border-gray-800 border-solid border hover:border-2 rounded-lg px-6 py-0.5"
                >
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <input
                    className="border border-solid border-gray-200 bg-gray-200 rounded-lg w-36 text-center h-"
                    value={page}
                    type="number"
                    onChange={(e) => setPage(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="bg-gray-200 border-gray-800 border-solid border hover:border-2 rounded-lg px-6 py-0.5"
                >
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                </button>
                <label
                    htmlFor="page-size"
                    className="text-lg text-gray-800 ml-8"
                >
                    Tamaño Página:
                </label>
                <select
                    name="page-size"
                    className="border border-solid border-gray-200 bg-gray-200 rounded-lg w-36 text-center"
                    onChange={(e) => setPageSize(e.target.value)}
                    value={pageSize}
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                </select>
            </div>
            {filterMode && (
                <FilterModal
                    columns={Object.keys(desc)}
                    filtered={columns}
                    setFilter={filterColumns}
                    close={toggleFilter}
                ></FilterModal>
            )}
        </div>
    );
};

export default TableVisComponent;
