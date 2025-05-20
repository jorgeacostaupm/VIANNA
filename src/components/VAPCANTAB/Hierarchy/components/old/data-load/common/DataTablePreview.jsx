import { useEffect, useState, useRef } from "react";
import { pubsub } from "../../../pubsub";

import { from, op } from "arquero";

const DataTablePreview = ({ updateFn }) => {
    const [preview, updatePreview] = useState(null);
    const [isShow, makeShown] = useState(false);
    const { subscribe, publish } = pubsub;

    subscribe("hidePreviewEvent", (data) => {
        makeShown(false);
    });

    // esta solución no es ideal y pero para no reescribir el código entero se usará
    subscribe("testTransform", ({ attribute, original, transform, format }) => {
        if (preview == null) return;

        let testdata = null;
        const test = from(preview);

        console.log("attr", attribute)

        switch (original) {
            case "string":
                if (transform == "number") {
                    test.derive({ [attribute]: (d) => op.parse_float(d[attribute]) });
                } else if (transform == "date") {
                    publish("getTestTransformEvent", {
                        valid: false,
                        column: attribute,
                    });
                }
                break;
        }
        publish("getTestTransformEvent", { valid: false, column: attribute });
    });

    subscribe("updatePreviewEvent", async (sourceInfo) => {
        const df = await updateFn(sourceInfo);
        console.log("updated")
        updatePreview(df.slice(0, 20).objects());
        makeShown(true);
    });

    subscribe("updatePreviewObjectsEvent", async (objs) => {
        updatePreview(objs);
        console.log("updated objects")
        makeShown(true);
    });

    const showColumnTransform = (c) => {
        document.querySelector(`[data-column="${c}"]`).scrollIntoView({block: "nearest", inline: "nearest"})
    }

    if (!isShow || preview == null) return <></>;
    const columns = Object.keys(preview[0]);
    return (
        <div className="w-full mt-2 grow overflow-auto mb-2">
            <table
                className={`overflow-auto border-collapse table-fixed ${
                    columns.length <= 8 ? "w-full" : ""
                }`}
            >
                <thead className="font-bold">
                    <tr className="text-lg ">
                        {columns.map((c, i) => {
                            return (
                                <th
                                    key={`c-${i}`}
                                    title={c}
                                    className={`${
                                        columns.length > 8
                                            ? "max-w-[12rem]"
                                            : `w-[${
                                                  (1 / columns.length) * 100
                                              }%]`
                                    } truncate sticky top-0 z-[12] bg-zinc-100 `}
                                >
                                    <div
                                        className={`p-3 h-full ${
                                            c === ""
                                                ? ""
                                                : "border-x border-solid border-gray-500"
                                        } w-full text-center text-nowrap truncate cursor-pointer select-none`}
                                        onClick={() => showColumnTransform(c)}
                                    >
                                        {c}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="" id="preview-body">
                    {preview.map((r, i) => {
                        return (
                            <tr
                                key={`${i}`}
                                className="border-b border-0 border-solid border-gray-400"
                            >
                                {columns.map((c, j) => {
                                    return (
                                        <td
                                            className="p-3 border-x border-solid border-gray-400"
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
    );
};

export default DataTablePreview;
