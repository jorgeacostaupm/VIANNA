import { useState, useRef, useEffect, useContext } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as yup from "yup";

import { pubsub } from "../../../pubsub";
import { useDispatch } from "react-redux";
import { transform } from "framer-motion";

const ArrowPointer = () => {
  return (
    <svg width="100%" className="h-7 invisible 2xl:visible z-[-1]">
      <defs>
        <marker
          id="right-head"
          orient="auto"
          markerWidth="4"
          markerHeight="4"
          refX="0.1"
          refY="2"
        >
          <path d="M0,0 V4 L4,2 Z" fill="#52525b" />
        </marker>
        <marker
          id="left-head"
          orient="auto"
          markerWidth="4"
          markerHeight="4"
          refX="0.5"
          refY="2"
        >
          <path d="M0,2 L4,0 V4 Z" fill="#52525b" />
        </marker>
      </defs>

      <line
        x1="15%"
        y1="50%"
        x2="85%"
        y2="50%"
        stroke="#52525b"
        strokeWidth="3"
        markerEnd="url(#right-head)"
        markerStart="url(#left-head)"
      />
    </svg>
  );
};

const TransformInput = ({ idx, name, warnings }) => {
  const { values, errors } = useFormikContext();

  const data = values.transforms[idx];
  const error =
    warnings.length != 0
      ? warnings.find((n) => n != null && n.col === name)?.msg
      : "";
  const typeMap = { number: "Número", date: "Fecha", string: "Texto" };

  return (
    <div
      data-column={name}
      className="grid grid-cols-7 w-full items-center px-1 border-stone-300 border-1 border-solid rounded-lg py-1.5 gap-3"
    >
      <span className="text-lg font-semibold text-center">{name}</span>
      <div className="flex gap-3 items-center w-full">
        <span className="text-nowrap">Tipo de Dato Inicial: </span>
        <div className="text-lg px-2 z-1 bg-zinc-50 py-0.5 rounded-md text-center text-purple-700 font-bold">
          {typeMap[data["original"]]}
        </div>
      </div>
      <ArrowPointer />
      <div className="col-span-3 flex gap-2 items-center ml-[-0.375rem]">
        <span className="text-nowrap">Cambio de Tipo de Dato: </span>
        <Field
          as="select"
          id={`transforms[${idx}].transform`}
          name={`transforms[${idx}].transform`}
          className={`transform-select ${
            data.transform === data.original
              ? "border-stone-400"
              : error == null || error.length == 0
              ? "border-green-500"
              : "border-yellow-400"
          }`}
        >
          <option value="string">Texto</option>
          <option value="number">Número</option>
          <option value="date">Fecha </option>
        </Field>
        {data.transform === "date" && data["original"] == "string" ? (
          <div className={`flex flex-grow gap-2 items-center ml-3`}>
            <span className="text-nowrap">
              <a
                href="https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table"
                target="_blank"
              >
                Formato Fecha
              </a>
            </span>
            <Field
              id={`transforms[${idx}].format`}
              name={`transforms[${idx}].format`}
              as="input"
              className="px-2 py-1 rounded-md outline-none border-solid border focus:borderfocus:border-gray-200 active:border-gray-600 w-full font-consola"
              placeholder="Formato de Fecha (Estandar ISO)"
            />
          </div>
        ) : (
          ""
        )}
      </div>
      <span className="text-red-500 text-nowrap font-bold text-center text-lg">
        {error}
      </span>
    </div>
  );
};

const detectChange = (p, n) => {
  const change = [];
  if (p.length !== n.length) {
    return [];
  }
  for (let idx = 0; idx < p.length; idx++) {
    const prev = p[idx];
    const newd = n[idx];
    if (prev.original !== newd.transform) {
      change.push({
        idx: idx,
        col: prev.attribute,
        transform: newd.transform,
        format: newd.format,
      });
    } else if (prev.transform == "date" && prev.format != newd.format) {
      change.push({
        idx: idx,
        col: prev.attribute,
        transform: newd.transform,
        format: newd.format,
      });
    }
  }
  return change;
};

const deriveOperation = (a, o, t, f) => {
  switch (t) {
    case "string":
      return `(r) => string(r[\"${a}\"])`;
    case "number":
      return `(r) => parse_float(r[\"${a}\"])`;
    case "date":
      if (o == "string") {
        return `(r) => parseDate(r[\"${a}\"], \"${f}\")`; // todo add format
      } else if (o == "number") {
        return `(r) => parseUnixDate(r[\"${a}\"])`; // todo add format
      } else {
        return `(r) => r[\"${a}\"]`;
      }
    default:
      return "(r) => null";
  }
};

const TypeFormatStep = ({
  data,
  previewData,
  prev,
  next,
  dispatcher,
  closeFn,
  sectionName,
}) => {
  const [warnings, setWarnings] = useState([]);
  const { publish } = pubsub;

  console.log("data", data);

  const dispatch = useDispatch();
  const onSubmit = (values) => {
    console.log("VALUES", values);
    dispatch(dispatcher(values));
    publish("hidePreviewEvent", {});
    next(values);
  };

  const validateTransform = (values, props) => {
    const errors = [];
    console.log("values qui0", values.transforms[0].original);

    const changes = detectChange(data.transforms, values.transforms);
    if (changes.length < 1) return;
    values.transforms.forEach((t, i) => {
      const wasChange = changes.find((d) => d.col === t.attribute) != null;
      if (!wasChange) return;

      const nrow = previewData.numRows();
      // if (t.transform == 'date' || t.original == 'date') {
      //     errors[i] =  { col: t.attribute, msg: 'Sin Implementar' }
      //     return;
      // }
      // const origin = previewData.filter(`k => k[\"${t.attribute}\"] == null`).numRows();
      const testDF = previewData
        .derive({
          [t.attribute]: deriveOperation(
            t.attribute,
            t.original,
            t.transform,
            t.format
          ),
        })
        .filter(`k => k[\"${t.attribute}\"] == null`)
        .numRows();

      if (nrow == testDF) {
        errors[i] = { col: t.attribute, msg: "Se borran todos" };
      }
    });

    setWarnings(errors);
    return null;
  };

  return (
    <Formik
      initialValues={data}
      enableReinitialize
      validate={validateTransform}
      onSubmit={onSubmit}
    >
      {({
        setFieldValue,
        setFieldError,
        errors,
        values,
        isValid,
        isSubmitting,
      }) => {
        // useEffect(() => {
        //     //if (isValid) {
        //     //    publish("updatePreviewEvent", values);
        //     //}
        //     console.log("errores", errors);
        // }, [values]);

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
                type="submit"
                className="ml-4 justify-self-start flex gap-2 items-center group"
              >
                <span className="text-lg  text-white group-hover:bg-green-600 bg-green-500 rounded-xl px-4 py-2">
                  Confirmar y Cargar
                </span>
              </button>

              <div className="w-[calc(30%_+2rem)]"></div>
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

            <div className="max-h-[16rem] flex flex-col items-center justify-centert w-full mt-6 overflow-y-scroll gap-y-1.5">
              {values.transforms.map((m, i) => (
                <TransformInput
                  key={m["attribute"]}
                  idx={i}
                  name={m["attribute"]}
                  warnings={warnings}
                />
              ))}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default TypeFormatStep;
