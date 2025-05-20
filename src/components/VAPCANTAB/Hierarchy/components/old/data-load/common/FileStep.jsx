import { Form, Formik, Field } from "formik";
import FileDropZone from "./FileDropZone";
import { pubsub } from "../../../pubsub";
import { useEffect } from "react";

import * as yup from "yup";

const FileStep = ({ next, data, closeFn, sectionName, acceptedFiles }) => {
    const { publish } = pubsub;

    const onSubmit = (values) => {
        publish("updatePreviewEvent", values);
        next(values);
    };

    const validationSchema = yup.object().shape({
        fileURL: yup.string().trim().required('Añada el Archivo Necesario'),
      }).noUnknown();

    return (
        <Formik initialValues={data} onSubmit={onSubmit} validationSchema={validationSchema} validateOnChange={true} enableReinitialize={true}>
            {({ setFieldValue, submitForm, values, errors, isValid }) => {
                useEffect(() => {
                    if (isValid && values.fileURL != data.fileURL) {
                        console.log("submiting form");
                        submitForm()
                    }
                }, [values.fileURL]);
                return (
                    <Form className="w-full flex-col flex">
                        <div className="flex items-center mt-2 border-0 border-b-2 border-solid border-gray-600 pb-4">
                            <button
                                type="submit"
                                className="ml-4 justify-self-start flex gap-3 items-center group"
                            >
                                <span className="text-lg  text-gray-600 group-hover:text-gray-900">
                                    Siguiente Paso
                                </span>
                                <i className="fa-solid fa-chevron-right text-lg text-gray-600 group-hover:text-gray-900"></i>
                            </button>
                            <span className="ml-2 w-[calc(30%_-_4px)] text-red-500 text-lg">
                                {errors.fileURL}
                            </span>
                            <h3 className="mr-auto text-lg font-semibold justify-self-center col-span-2">
                                {sectionName}
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
                        {/* <div className="flex mt-6">
                        <button type="submit" className={`mx-auto ${isValid ? 'opacity-100': 'opacity-0'} bg-green-500 hover:bg-green-600 rounded-xl px-12 py-3 text-white text-lg`}>
                            Continuar
                        </button>
                    </div> */}
                        <FileDropZone
                            setFieldValue={setFieldValue}
                            submitForm={submitForm}
                            accepts={acceptedFiles}
                        ></FileDropZone>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default FileStep;
