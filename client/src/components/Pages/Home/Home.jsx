import { useEffect, useState } from "react";

import DataPanel from "./DataPanel.jsx";
import MaterialsChart from "./MaterialsChart.jsx";
import MaterialsWasteChart from "./MaterialsWasteChart.jsx";
import ProjectsChart from "./ProjectsChart.jsx";
import EmployeesChart from "./EmployeesChart.jsx";
import DashboardChartGrid from "./DashboardChartGrid.jsx";

import { getHomeKPIs } from "@services/HomeServices.js";

function Home() {
  const [kpiData, setKpiData] = useState({
    planejado_kg: 0,
    processado_kg: 0,
    refugo_kg: 0,
  });

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await getHomeKPIs();

        if (data) {
          setKpiData(data);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar KPIs da Home:",
          error
        );
      }
    };

    fetchKpis();
  }, []);

  const charts = [
    {
      id: "materials",
      element: <MaterialsChart />,
    },
    {
      id: "waste",
      element: <MaterialsWasteChart />,
    },
    {
      id: "projects",
      element: <ProjectsChart />,
    },
    {
      id: "employees",
      element: <EmployeesChart />,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] font-sans">
      <div className="px-6 md:px-8 py-6">
        {/* =================================================
            TÍTULO
        ================================================== */}
        <div className="mb-5">
          <h1 className="m-0 text-[22px] font-bold text-[#172B4D]">
            Sistema de Controle de Produção
          </h1>

          <p className="m-0 mt-1 text-[12px] text-[#5E6C84]">
            Visão geral dos principais indicadores de produção.
          </p>
        </div>

        {/* =================================================
            KPIs
        ================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DataPanel
            title="Planejado"
            value={kpiData.planejado_kg}
            unit="KG"
          />

          <DataPanel
            title="Processado"
            value={kpiData.processado_kg}
            unit="KG"
          />

          <DataPanel
            title="Refugo"
            value={kpiData.refugo_kg}
            unit="KG"
          />
        </div>

        {/* =================================================
            GRÁFICOS
        ================================================== */}
        <DashboardChartGrid charts={charts} />
      </div>
    </div>
  );
}

export default Home;

