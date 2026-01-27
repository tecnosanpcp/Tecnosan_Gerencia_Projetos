import { useEffect, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { vwEmployeesAnalytics } from '@services/HomeServices.js'; 

const EmployeesChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwEmployeesAnalytics();
      // Pega apenas os top 10 com mais horas extras para não poluir o gráfico
      setData(result.slice(0, 10));
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-[350px] flex flex-col">
      <h3 className="text-gray-600 font-bold mb-4 text-sm uppercase">Top 10 - Horas Extras vs Faltas</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="user_id" label={{ value: 'ID Func.', position: 'insideBottom', offset: -5 }} />
            <YAxis yAxisId="left" label={{ value: 'Horas Extras', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Faltas', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="horas_extras_decimais" name="Horas Extras" barSize={20} fill="#f59e0b" />
            <Line yAxisId="right" type="monotone" dataKey="qtd_faltas" name="Qtd. Faltas" stroke="#ef4444" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeesChart;