import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { vwProjectsEvolution } from '@services/HomeServices.js'; 

const ProjectsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await vwProjectsEvolution();
      // Converte string '50.00' para numero 50.00 para o gráfico ler corretamente
      const formatted = result.map(item => ({
        ...item,
        progresso_percentual: Number(item.progresso_percentual)
      }));
      setData(formatted);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      <h3 className="text-gray-600 font-bold mb-4 text-sm uppercase">Progresso dos Projetos (%)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="projeto" type="category" width={100} tick={{fontSize: 11}} />
            <Tooltip />
            <Bar dataKey="progresso_percentual" name="Conclusão %" fill="#10b981" radius={[0, 4, 4, 0]}>
               {/* Muda cor se estiver concluído (100%) */}
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.progresso_percentual >= 100 ? '#059669' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectsChart;