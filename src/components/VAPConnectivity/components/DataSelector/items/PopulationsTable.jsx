import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setPopulations } from "@/components/VAPUtils/features/selection/selectionSlice";

const columns = [
  {
    title: "Population Name",
    dataIndex: "name",
  },
  {
    title: "Mean Age",
    dataIndex: "age",
  },
  {
    title: "Nº Subjects Visit 1",
    dataIndex: "visit1",
  },
  {
    title: "Nº Subjects Visit 2",
    dataIndex: "visit2",
  },
  {
    title: "Nº Subjects Visit 3",
    dataIndex: "visit3",
  },
  {
    title: "Nº Subjects Visit 4",
    dataIndex: "visit4",
  },
  {
    title: "Statistics",
    dataIndex: "statistic",
  },
];

const pageSize = 8;

const fake_populations = [];
for (let i = 0; i < 100; i++) {
  const randomNumberWithDecimals =
    (Math.floor(Math.random() * (900 - 600 + 1)) + 600) / 10;

  fake_populations.push({
    key: i,
    name: `Population ${i}`,
    id: "someid",
    visits: [1, 2, 4],
    measures: ["plv", "aec", "ciplv", "coherence"],
    bands: [
      "delta",
      "theta",
      "alpha_low",
      "alpha_high",
      "beta_low",
      "beta_high",
      "gamma",
    ],
    atlases: ["aal"],
    age: randomNumberWithDecimals,
    statistic: `some measure`,
  });
}

const PopulationsTable = () => {
  const dispatch = useDispatch();
  const populations = useSelector((state) => state.selection.populations);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("link to available populations :)");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    setData(fake_populations);

    return () => {};
  }, []);

  const onChange = (new_items) => {
    if (new_items.length < 3) {
      const populations = new_items.map((row_key) => data[row_key]);
      dispatch(setPopulations(populations));
    } else {
      new_items.pop();
    }
  };

  const rowSelection = {
    selectedRowKeys: populations.map((p) => p.key),
    onChange: onChange,
    hideSelectAll: true,
  };

  return (
    <Table
      size={"small"}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      pagination={{
        pageSizeOptions: [8, 10, 20, 30, 50, 100],
        defaultPageSize: pageSize,
        showSizeChanger: true,
      }}
    />
  );
};

export default PopulationsTable;
