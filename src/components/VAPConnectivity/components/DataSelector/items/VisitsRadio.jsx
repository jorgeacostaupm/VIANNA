import React from "react";
import { Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setVisits } from "@/components/VAPUtils/features/selection/selectionSlice";

const VisitsRadio = ({ common_visits, population, i }) => {
  const dispatch = useDispatch();

  const onChangeMeasure = (e) => {
    const payload = { index: i, value: e.target.value };
    dispatch(setVisits(payload));
  };

  return (
    <div>
      <div>Visit for {population}: </div>
      <Radio.Group onChange={onChangeMeasure}>
        {common_visits.map((visit) => (
          <Radio key={visit} value={visit}>
            Visit {visit}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};

export default VisitsRadio;
