import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { vwMaterialsConsumption } from "@services/HomeServices.js";

const MaterialsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwMaterialsConsumption();
      setData(result);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 20,
              left: 0,
              bottom: 8,
            }}
          >
            <CartesianGrid
              stroke="#EBECF0"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="mes"
              tick={{
                fontSize: 10,
                fill: "#6B778C",
              }}
              axisLine={{
                stroke: "#DFE1E6",
              }}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 10,
                fill: "#6B778C",
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                fill: "#F4F5F7",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(2)} Kg`,
                "Consumo",
              ]}
              contentStyle={{
                border: "1px solid #DFE1E6",
                borderRadius: "6px",
                boxShadow:
                  "0 4px 12px rgba(9, 30, 66, 0.15)",
                fontSize: "12px",
              }}
            />

            <Bar
              dataKey="quantidade_total"
              name="Consumo"
              fill="#0052CC"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MaterialsChart;