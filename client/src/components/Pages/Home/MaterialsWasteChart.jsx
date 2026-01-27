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
import { vwMaterialsWaste } from "@services/HomeServices.js";

const MaterialsWasteChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwMaterialsWaste();
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <h3 className="text-gray-600 font-bold mb-4 text-sm uppercase">
        Desperdício (Refugo)
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            {/* Note a cor vermelha (#ef4444) e a dataKey "quantidade_refugo" definida na query SQL anterior */}
            <Bar
              dataKey="quantidade_refugo"
              name="Refugo (Kg)"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MaterialsWasteChart;
