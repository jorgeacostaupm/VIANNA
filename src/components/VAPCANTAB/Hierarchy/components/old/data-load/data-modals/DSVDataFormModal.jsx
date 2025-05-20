import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as yup from "yup";

import FileStep from "../common/FileStep";

import { loadCSV } from "arquero";
import DataTablePreview from "../common/DataTablePreview";
import { pubsub } from "../../../pubsub";

import { useDispatch } from "react-redux";
import { extractMeta, updateFromCSV } from "@/components/VAPUtils/features/data/dataSlice";

import LoadingDataSpinner from "../common/LoadingDataSpinner";
import TypeFormatStep from "../common/TypeFormatStep";

const CSVConfigurationStep = ({ data, prev, next, closeFn }) => {
    const { publish } = pubsub;

    const dispatch = useDispatch();

    const onSubmit = (values) => {
        next(values);
        // next();
    };

    const validationSchema = yup.object().shape({
        source: yup.mixed().oneOf(["dsv"]).required(),
        fileURL: yup.string().required(),
        opts: yup
            .object()
            .shape({
                delimiter: yup
                    .string()
                    .required("Debes seleccionar un delimitador"),
                decimal: yup
                    .string()
                    .required(
                        "Debes seleccionar un separador de números decimales"
                    ),
                encoding: yup
                    .string()
                    .required("Debes seleccionar un encoding del archivo"),
            })
            .required(),
        transforms: yup.array().optional()
    });

    return (
        <Formik
            initialValues={data}
            onSubmit={onSubmit}
            enableReinitialize={true}
            validationSchema={validationSchema}
        >
            {({
                setFieldValue,
                submitForm,
                errors,
                values,
                isValid,
                isSubmitting,
            }) => {
                useEffect(() => {
                    if (isValid) {
                        publish("updatePreviewEvent", values);
                    }
                }, [values]);

                return (
                    <Form className="w-full flex-col flex">
                        <div className="flex items-center mt-2 border-0 border-b-2 border-solid border-gray-600 pb-4">
                        <button
                                type="button"
                                onClick={() => prev(values)}
                                className="ml-4 justify-self-start flex gap-2 items-center group"
                            >
                                <i className="fa-solid fa-chevron-left text-lg text-gray-600 group-hover:text-gray-900"></i>
                                <span className="text-lg  text-gray-600 group-hover:text-gray-900">
                                    Paso Previo
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => next(values)}
                                className="ml-4 justify-self-start flex gap-2 items-center group"
                            >
                                <span className="text-lg  text-gray-600 group-hover:text-gray-900">
                                    Paso Siguiente
                                </span>
                                <i className="fa-solid fa-chevron-right text-lg text-gray-600 group-hover:text-gray-900"></i>
                            </button>
                            <div className="w-[calc(30%_+2rem)]"></div>
                            <h3 className="mr-auto text-lg font-semibold justify-self-center col-span-2">
                                Carga de Archivos CSV / TSV / DSV
                            </h3>
                            <button
                                type="button"
                                onClick={closeFn}
                                className="mr-4 justify-self-end"
                            >
                                <i
                                    className={`fa-solid fa-xmark text-red-600 font-semibold text-3xl `}
                                ></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 items-center w-full mt-6  gap-y-2 gap-x-4">
                            <div className="flex items-center justify-center gap-4 p-4 ">
                                <label
                                    htmlFor="opts.delimiter"
                                    className="text-lg"
                                >
                                    Delimitador:
                                </label>
                                <Field
                                    as="select"
                                    className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                    name="opts.delimiter"
                                    id="opts.delimiter"
                                >
                                    <option value=",">Coma</option>
                                    <option value=";">Punto y Coma</option>
                                    <option value="\t">Tabulador</option>
                                </Field>
                            </div>
                            <div className="flex items-center justify-center gap-4 p-4 ">
                                <label
                                    htmlFor="opts.decimal"
                                    className="text-lg"
                                >
                                    Separador Decimales:
                                </label>
                                <Field
                                    as="select"
                                    className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                    name="opts.decimal"
                                    id="opts.decimal"
                                >
                                    <option value=",">Coma</option>
                                    <option value=".">Punto</option>
                                </Field>
                            </div>
                            <div className="flex items-center justify-center gap-4 p-4">
                                <label
                                    htmlFor="opts.encoding"
                                    className="text-lg"
                                >
                                    Encoding del Archivo:
                                </label>
                                <Field
                                    as="select"
                                    className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                    name="opts.endcoding"
                                    id="opts.endcoding"
                                >
                                    <option value="utf-8">UTF-8</option>
                                    <option value="latin-1">Latin 1</option>
                                    <option value="latin-2">Latin 2</option>
                                    <option value="other">Por Tener</option>
                                </Field>
                            </div>
                            <div className="flex items-center justify-center col-start-2">
                                <button
                                    type="submit"
                                    className={`px-12 py-3 text-white text-lg ${
                                        !isValid || isSubmitting
                                            ? "bg-gray-700"
                                            : "bg-green-500 hover:bg-green-600 rounded-xl"
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};

let previewData;
const DSVDataFormModal = ({ setSource }) => {
    const { publish } = pubsub;
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        source: "dsv",
        fileURL: null,
        opts: {
            delimiter: ",",
            decimal: ".",
            encoding: "utf-8",
        },
        transforms: [],
    });
    
    const updateFn = async (sourceInfo) => {
        const { fileURL, opts } = sourceInfo;
        // TODO todo-bugfix point 8 Add encoding
        const df = await loadCSV(fileURL, {
            delimiter: opts.delimiter,
            decimal: opts.decimal,
        });


        const meta = extractMeta(df);
        const ret = [];
        for (const key in meta) {
            ret.push({
                attribute: key,
                original: meta[key],
                transform: meta[key],
                other: ""
            })
        }

        previewData = df.slice(0, 20);
        setData(p => ({...sourceInfo, transforms: ret }) )        

        // const dtypes = extractMeta(df);
        // setDtypes(dtypes);

        return df;
    };

    const handlePrev = (values) => {
        setData((prev) => ({ ...prev, ...values }));
        publish("hidePreviewEvent", {});
        setStep((p) => p - 1);
    };

    const handleNext = (values) => {
        setData((prev) => ({ ...prev, ...values }));
        setStep((p) => p + 1);
    };

    const steps = [
        <FileStep
            next={handleNext}
            data={data}
            sectionName="Carga de Archivos CSV / TSV / DSV"
            acceptedFiles={{ "text/csv": [".csv"] }}
            closeFn={() => setSource("")}
        ></FileStep>,
        <CSVConfigurationStep
            prev={handlePrev}
            next={handleNext}
            data={data}
            closeFn={() => setSource("")}
        ></CSVConfigurationStep>,
        <TypeFormatStep
            prev={handlePrev}
            next={handleNext}
            sectionName="Carga de Archivos CSV / TSV / DSV"
            data={data}
            previewData={previewData}
            dispatcher={updateFromCSV}
            closeFn={() => setSource("")}
        ></TypeFormatStep>,
        <LoadingDataSpinner closeFn={() => setSource("")} />,
    ];

    return (
        <>
            <div
                className="absolute top-0 left-0 z-[20] w-screen h-screen bg-gray-500 opacity-[0.65]"
                onClick={() => setSource("")}
            />
            <div className="data-source-modal box-border overflow-clip">
                {steps[step]}
                <DataTablePreview updateFn={updateFn} />
            </div>
        </>
    );
};

export default DSVDataFormModal;
