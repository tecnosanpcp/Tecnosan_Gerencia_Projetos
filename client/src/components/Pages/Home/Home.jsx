import { useEffect, useState } from "react";
import NavBar from "../../Ui/NavBar.jsx";
import DataPanel from "./DataPanel.jsx";
import MaterialsChart from "./MaterialsChart.jsx";
import MaterialsWasteChart from "./MaterialsWasteChart.jsx";
import ProjectsChart from "./ProjectsChart.jsx";
import EmployeesChart from "./EmployeesChart.jsx";
import { getHomeKPIs } from "@services/HomeServices.js";
function Home() {
  localStorage.setItem("loginPermission", false);
  const [kpiData, setKpiData] = useState({
    planejado_kg: 0,
    processado_kg: 0,
    refugo_kg: 0,
  });
  useEffect(() => {
    const fetchKpis = async () => {
      const data = await getHomeKPIs();
      if (data) {
        setKpiData(data);
      }
    };
    fetchKpis();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#eff2f6] flex flex-col font-sans pb-10">
      <div className="mb-6">
        <NavBar select_index={0} />
      </div>

      <div className="flex flex-col px-6 md:px-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DataPanel title="Planejado" value={kpiData.planejado_kg} unit="KG" />
          <DataPanel
            title="Processado"
            value={kpiData.processado_kg}
            unit="KG"
          />
          <DataPanel title="Refugo" value={kpiData.refugo_kg} unit="KG" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="w-full h-[350px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <MaterialsChart />
          </div>

          <div className="w-full h-[350px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <MaterialsWasteChart />
          </div>

          <div className="w-full h-[350px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <ProjectsChart />
          </div>

          <div className="w-full h-[350px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <EmployeesChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
