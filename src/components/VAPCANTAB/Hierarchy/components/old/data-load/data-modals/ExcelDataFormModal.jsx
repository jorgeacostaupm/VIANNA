import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as yup from "yup";

import FileStep from "../common/FileStep";

import { from } from "arquero";
import * as XLSX from "xlsx";

import DataTablePreview from "../common/DataTablePreview";
import { pubsub } from "../../../pubsub";

import { useDispatch } from "react-redux";
import { extractMeta, updateFromExcel } from "@/components/VAPUtils/features/data/dataSlice";

import LoadingDataSpinner from "../common/LoadingDataSpinner";
import TypeFormatStep from "../common/TypeFormatStep";

const ExcelConfigurationStep = ({
    data,
    prev,
    closeFn,
    sheets,
    partial,
    next,
}) => {
    const dispatch = useDispatch();

    const onSubmit = (values) => {
        next(values);
        // dispatch(updateFromExcel(values));
    };

    const validationSchema = yup.object().shape({
        source: yup.mixed().oneOf(["excel"]).required(),
        fileURL: yup.string().required(),
        opts: yup
            .object()
            .shape({
                sheetname: yup
                    .string()
                    .required("Debes seleccionar una hoja de cálculo"),
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
                        partial(values);
                    }
                }, [values]);
                return (
                    <Form className="w-full flex-col flex">
                        <div className="flex items-center mt-2 border-0 border-b-2 border-solid border-gray-600 pb-4">
                            <button
                                type="button"
                                onClick={() => prev(values)}
                                className="ml-4 justify-self-start flex gap-3 items-center group"
                            >
                                <i className="fa-solid fa-chevron-left text-lg text-gray-600 group-hover:text-gray-900"></i>
                                <span className="text-lg  text-gray-600 group-hover:text-gray-900">
                                    Paso Previo
                                </span>
                            </button>
                            <div className="w-[calc(30%_+2rem)]"></div>
                            <h3 className="mr-auto text-lg font-semibold justify-self-center col-span-2">
                                Carga de Archivos Excel
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
                        <div className="grid grid-cols-3 items-center w-full mt-6  gap-y-8 gap-x-4">
                            <div className="flex items-center justify-center gap-4 p-4 ">
                                <label
                                    htmlFor="opts.sheetname"
                                    className="text-lg text-nowrap"
                                >
                                    Hoja de Cálculo:
                                </label>
                                <Field
                                    as="select"
                                    className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                    name="opts.sheetname"
                                    id="opts.sheetname"
                                >
                                    {sheets.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
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
                                    className={`px-12 py-6 text-white text-lg ${
                                        !isValid || isSubmitting
                                            ? "bg-gray-700"
                                            : "bg-green-500 hover:bg-green-600 rounded-xl"
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    Cargar Datos
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
const ExcelDataFormModal = ({ setSource }) => {
    const { publish } = pubsub;
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        source: "excel",
        fileURL: null,
        opts: {
            sheetname: "",
            encoding: "utf-8",
        },
        transforms: [],
    });

    const [file, setFile] = useState(null);
    const [sheets, setSheets] = useState([]);

    const fullUpdateFn = async (sourceInfo) => {
        const { fileURL, opts } = sourceInfo;

        const response = await fetch(fileURL);
        const data = await response.arrayBuffer();

        const workbook = XLSX.read(data, { type: "buffer" });
        setFile(workbook);

        // Get the first sheet
        const firstSheetName =
            opts.sheetname.length > 0 && step !== 0
                ? opts.sheetname
                : workbook.SheetNames[0];

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const df = from(jsonData);
        previewData = df;
        const ret = [];
        const meta = extractMeta(df);
        for (const key in meta) {
            ret.push({
                attribute: key,
                original: meta[key],
                transform: meta[key],
                other: ""
            })
        }

        if (sheets.length === 0) {
            setSheets(workbook.SheetNames);
            setData((prev) => {
                return {
                    source: sourceInfo.source,
                    fileURL: sourceInfo.fileURL,
                    opts: {
                        sheetname: workbook.SheetNames[0],
                        encoding: sourceInfo.opts.encoding,
                    },
                    transforms: ret
                };
            });
        }

        return df;
    };

    const partialUpdate = (sourceInfo) => {
        if (file == null) return;
        const worksheet = file.Sheets[sourceInfo.opts.sheetname];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const df = from(jsonData);
        previewData = df;

        const ret = [];
        const meta = extractMeta(df);
        for (const key in meta) {
            ret.push({
                attribute: key,
                original: meta[key],
                transform: meta[key],
                other: ""
            })
        }
        setData(p => {
            return {...sourceInfo, transforms: ret};
        })  

        const objs = df.objects();
        publish("updatePreviewObjectsEvent", objs);
        // return df;
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
            sectionName="Carga de Archivos Excel"
            acceptedFiles={{
                "application/vnd.openxmlformats-officedocument.spreadsheetml.shee":
                    [".xlsx", ".xls"],
            }}
            closeFn={() => setSource("")}
        ></FileStep>,
        <ExcelConfigurationStep
            prev={handlePrev}
            next={handleNext}
            data={data}
            sheets={sheets}
            partial={partialUpdate}
            closeFn={() => setSource("")}
        ></ExcelConfigurationStep>,
        <TypeFormatStep
            prev={handlePrev}
            next={handleNext}
            sectionName="Carga de Archivos Excel"
            data={data}
            previewData={previewData}
            dispatcher={updateFromExcel}
            closeFn={() => setSource("")}>
        </TypeFormatStep>,
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
                <DataTablePreview updateFn={fullUpdateFn} />
            </div>
        </>
    );
};

export default ExcelDataFormModal;
