import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { vwProjectsEvolution } from "@services/HomeServices.js";

const ProjectsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwProjectsEvolution();

      // Mantém exatamente os dados vindos da API.
      // Apenas converte o percentual para número para o Recharts.
      const formatted = result.map((item) => ({
        ...item,
        progresso_percentual:
          item.progresso_percentual === null
            ? 0
            : Number(item.progresso_percentual),
      }));

      setData(formatted);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 8,
              right: 20,
              left: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid
              stroke="#EBECF0"
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{
                fontSize: 10,
                fill: "#6B778C",
              }}
              axisLine={{ stroke: "#DFE1E6" }}
              tickLine={false}
            />

            <YAxis
              dataKey="projeto"
              type="category"
              width={125}
              tick={{
                fontSize: 10,
                fill: "#5E6C84",
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "#F4F5F7" }}
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                "Conclusão",
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
              dataKey="progresso_percentual"
              name="Conclusão"
              fill="#0052CC"
              radius={[0, 4, 4, 0]}
              barSize={18}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`project-cell-${index}`}
                  fill={
                    entry.progresso_percentual >= 100
                      ? "#0747A6"
                      : "#0052CC"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectsChart;