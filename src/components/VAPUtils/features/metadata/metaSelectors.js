import { createSelector } from "@reduxjs/toolkit";

/**
Selector para poder obtener las descripciones y tipos de datos de los atributos del conjunto de datos.

Devuelve un objecto donde cada clave es una atributo y el valor es un array con (en orden):
1. Descripción
2. Tipo : Root / Agregación / Atributo
3. Tipo de Dato.

**/
export const selectDescriptions = createSelector(
    (state) => state.metadata.attributes,
    (attrs) =>
        attrs.reduce((acc, n) => {
            acc[n.name] = [n.desc, n.type, n.dtype];
            return acc;
        }, {})
);
