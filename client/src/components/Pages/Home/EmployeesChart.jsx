import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { vwEmployeesAnalytics } from "@services/HomeServices.js";

const EmployeesChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwEmployeesAnalytics();

      // Mantém o comportamento original.
      setData(result.slice(0, 10));
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 8,
              right: 15,
              left: 5,
              bottom: 8,
            }}
          >
            <CartesianGrid
              stroke="#EBECF0"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="user_id"
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
              yAxisId="left"
              tick={{
                fontSize: 10,
                fill: "#6B778C",
              }}
              axisLine={false}
              tickLine={false}
              width={38}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{
                fontSize: 10,
                fill: "#6B778C",
              }}
              axisLine={false}
              tickLine={false}
              width={30}
            />

            <Tooltip
              cursor={{
                fill: "#F4F5F7",
              }}
              contentStyle={{
                border: "1px solid #DFE1E6",
                borderRadius: "6px",
                boxShadow:
                  "0 4px 12px rgba(9, 30, 66, 0.15)",
                fontSize: "12px",
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              wrapperStyle={{
                fontSize: "11px",
                color: "#5E6C84",
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="horas_extras_decimais"
              name="Horas Extras"
              barSize={22}
              fill="#0052CC"
              radius={[4, 4, 0, 0]}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="qtd_faltas"
              name="Qtd. Faltas"
              stroke="#DE350B"
              strokeWidth={2}
              dot={{
                r: 3,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeesChart;