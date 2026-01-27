import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vwMaterialsConsumption } from '@services/HomeServices.js'; 

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
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <h3 className="text-gray-600 font-bold mb-4 text-sm uppercase">Consumo de Materiais (Ano Atual)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{fontSize: 12}} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade_total" name="Qtd (Kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MaterialsChart;