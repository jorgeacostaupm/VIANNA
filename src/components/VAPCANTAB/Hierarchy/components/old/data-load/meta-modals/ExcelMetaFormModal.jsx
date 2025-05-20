import React, { useEffect, useState, useRef } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as yup from "yup";

import FileStep from "../common/FileStep";

import { from } from "arquero";
import * as XLSX from "xlsx";

import DataTablePreview from "../common/DataTablePreview";
import { pubsub } from "../../../pubsub";
import { useDispatch } from "react-redux";
import { addDescriptionsFromExcel } from "@/components/VAPUtils/features/metadata/metaSlice";

// TODO todo-bugfix point 7

const ExcelConfigurationStep = ({
    data,
    prev,
    closeFn,
    sheets,
    partial,
    columns,
}) => {
    const dispatch = useDispatch();
    const { publish } = pubsub;
    const onSubmit = (values) => {
        publish("hidePreviewEvent", {})
        dispatch(addDescriptionsFromExcel(values));
        next();
    };

    const validationSchema = yup.object().shape({
        source: yup.mixed().oneOf(["excel"]).required(),
        fileURL: yup.string().required(),
        opts: yup
            .object()
            .shape({
                attributes: yup
                    .string()
                    .required("Debes seleccionar la columna de atributos"),
                descriptions: yup
                    .string()
                    .required(
                        "Debes seleccionar la columna con descripciones de atributos"
                    ),
                sheetname: yup
                    .string()
                    .required("Debes seleccionar una hoja de cálculo"),
                encoding: yup
                    .string()
                    .required("Debes seleccionar un encoding del archivo"),
            })
            .required(),
    });

    return (
        <Formik
            initialValues={data}
            onSubmit={onSubmit}
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
                console.log(errors, values);
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
                                    <option value="" hidden={sheets.length !== 0}>-</option>
                                </Field>
                            </div>

                            <div className="flex items-center justify-start gap-4 p-4">
                                <label
                                    htmlFor="opts.attributes"
                                    className="text-lg"
                                >
                                    Nombre de Atributos:
                                </label>
                                <Field
                                    as="select"
                                    className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                    name="opts.attributes"
                                    id="opts.attributes"
                                >
                                    {columns.map((c) => {
                                        return (
                                            <option key={"1-" + c} value={c}>
                                                {c}
                                            </option>
                                        );
                                    })}
                                </Field>
                            </div>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-start gap-4 p-4">
                                    <label
                                        htmlFor="opts.descriptions"
                                        className="text-lg"
                                    >
                                        Descripciones de Atributos:
                                    </label>
                                    <Field
                                        as="select"
                                        className="bg-zinc-100 py-1 px-4 text-lg min-w-[150px] text-center rounded-xl border border-solid border-gray-200 hover:border-gray-400"
                                        name="opts.descriptions"
                                        id="opts.descriptions"
                                    >
                                        {columns.map((c) => {
                                            return (
                                                <option
                                                    key={"2-" + c}
                                                    value={c}
                                                >
                                                    {c}
                                                </option>
                                            );
                                        })}
                                    </Field>
                                </div>
                                <span className="text-red-500 text-lg">
                                    {errors &&
                                        errors.opts &&
                                        errors.opts.descriptions}
                                </span>
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
                                            : "bg-green-500 hover:bg-green-600 rounded-xl active:bg-green-700"
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

const ExcelDataFormModal = ({ setSource }) => {
    const { publish } = pubsub;
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        source: "excel",
        fileURL: null,
        opts: {
            sheetname: "",
            attributes: "",
            descriptions: "",
            encoding: "utf-8",
        },
    });

    const [file, setFile] = useState(null);
    const [sheets, setSheets] = useState([]);
    const [columns, setColumns] = useState([]);

    const fullUpdateFn = async (sourceInfo) => {
        console.log(sourceInfo);
        const { fileURL, opts } = sourceInfo;
        
        const response = await fetch(fileURL);
        const data = await response.arrayBuffer();

        const workbook = XLSX.read(data, { type: "buffer" });
        setFile(workbook);

        // Get the first sheet
        const firstSheetName =
            opts.sheetname.length > 0 && step !== 0 && opts.sheetname != null
                ? opts.sheetname
                : workbook.SheetNames[0];

        const worksheet = workbook.Sheets[firstSheetName];
        const sheets = workbook.SheetNames
        setSheets(sheets);

        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const df = from(jsonData);
        const cols = df.columnNames()
        setColumns(cols);
        console.log("sheets", sheets , opts, sheets[0], "d sa");

        if (sheets.length !== 0) {
            setData((prev) => {
                return {
                    source: sourceInfo.source,
                    fileURL: sourceInfo.fileURL,
                    opts: {
                        sheetname: sheets[0],
                        encoding: sourceInfo.opts.encoding,
                        attributes: cols[0],
                        descriptions: cols[0]
                    },
                };
            });
        }


        return df;
    };

    const partialUpdate = (sourceInfo) => {
        if (file == null) return;
        const worksheet = file.Sheets[sourceInfo.opts.sheetname];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const df = from(jsonData)
        setColumns(df.columnNames());
        const objs = df.objects().slice(0, 20);
        publish("updatePreviewObjectsEvent", objs);
    };

    const handlePrev = (values) => {
        setData((prev) => ({ ...prev, ...values }));
        publish("hidePreviewEvent", {});
        setStep((p) => p - 1);
        setSheets([]);
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
            data={data}
            sheets={sheets}
            columns={columns}
            partial={partialUpdate}
            closeFn={() => setSource("")}
        ></ExcelConfigurationStep>,
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
