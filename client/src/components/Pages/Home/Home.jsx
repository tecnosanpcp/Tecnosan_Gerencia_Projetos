import { useEffect, useMemo, useState } from "react";

import DataPanel from "./DataPanel.jsx";
import KpiChartModal from "./KpiChartModal.jsx";

import MaterialsChart from "./MaterialsChart.jsx";
import MaterialsWasteChart from "./MaterialsWasteChart.jsx";
import ProjectsChart from "./ProjectsChart.jsx";
import EmployeesChart from "./EmployeesChart.jsx";

import ProjectEvolutionGraph from "../Reports/ProjectEvolutionGraph.jsx";
import TotalConsumptionGraph from "../Reports/TotalConsumptionGraph.jsx";
import LeadTimeGraph from "../Reports/LeadTimeGraph.jsx";

import DashboardChartGrid from "./DashboardChartGrid.jsx";

import { getHomeKPIs } from "@services/HomeServices.js";

import { VerifyAuth } from "@services/AuthService.js";
import {
  countStatusComponentsByProj,
  getLeadTimeVsReal,
} from "@services/ComponentsServices.js";

import { vwProjectConsumedMaterials } from "@services/ViewsService.js";

import {
  getDefaultDateRange,
  formatDateForApi,
} from "../../../utils/dateUtils";

function Home() {
  const [kpiData, setKpiData] = useState({
    planejado_kg: 0,
    processado_kg: 0,
    refugo_kg: 0,
  });

  /*
   * ============================================================
   * KPI SELECIONADO
   *
   * Controla qual gráfico de KPI está aberto.
   * Não altera nenhuma API ou lógica existente.
   * ============================================================
   */

  const [openedKpi, setOpenedKpi] = useState(null);

  /*
   * ============================================================
   * DADOS DOS GRÁFICOS DE RELATÓRIOS
   * ============================================================
   */

  const defaultDates = useMemo(
    () => getDefaultDateRange(3),
    []
  );

  const [reportData, setReportData] = useState({
    evolution: {
      categories: [],
      series: [],
    },
    consumption: [],
    leadTime: [],
  });

  /*
   * ============================================================
   * KPIs DA HOME
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const fetchKpis = async () => {
      try {
        const data = await getHomeKPIs();

        if (mounted && data) {
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

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * GRÁFICOS VINDOS DE RELATÓRIOS
   *
   * Mantém as mesmas APIs já utilizadas pela página
   * Relatórios.
   *
   * Não cria nenhuma API nova.
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const fetchReportCharts = async () => {
      try {
        const user = await VerifyAuth();

        if (!user || !mounted) {
          return;
        }

        const start = formatDateForApi(
          defaultDates.start
        );

        const end = formatDateForApi(
          defaultDates.end
        );

        const [evolutionRes, leadTimeRes, consumptionRes] =
          await Promise.all([
            countStatusComponentsByProj(
              null,
              null,
              start,
              end
            ),

            getLeadTimeVsReal(
              null,
              null,
              start,
              end
            ),

            vwProjectConsumedMaterials(
              user.user_id,
              null,
              start,
              end
            ),
          ]);

        if (!mounted) {
          return;
        }

        /*
         * ======================================================
         * EVOLUÇÃO POR EQUIPAMENTO
         *
         * Mesma transformação existente em Reports.jsx
         * ======================================================
         */

        const equipmentMap = new Map();

        (evolutionRes || []).forEach((item) => {
          const equipmentName =
            item.equipment_name || "Sem equipamento";

          const quantity =
            Number(item.numero_pecas) || 0;

          const status =
            (item.status || "").trim();

          if (!equipmentMap.has(equipmentName)) {
            equipmentMap.set(equipmentName, {
              entregues: 0,
              pendentes: 0,
            });
          }

          const entry =
            equipmentMap.get(equipmentName);

          if (status === "Completed") {
            entry.entregues += quantity;
          } else {
            entry.pendentes += quantity;
          }
        });

        const categories =
          Array.from(equipmentMap.keys());

        const series = [
          {
            name: "Entregues",
            data: categories.map(
              (category) =>
                equipmentMap.get(category).entregues
            ),
          },
          {
            name: "Pendentes",
            data: categories.map(
              (category) =>
                equipmentMap.get(category).pendentes
            ),
          },
        ];

        /*
         * ======================================================
         * ATUALIZA HOME
         * ======================================================
         */

        setReportData({
          evolution: {
            categories,
            series,
          },

          consumption:
            Array.isArray(consumptionRes)
              ? consumptionRes
              : [],

          leadTime:
            Array.isArray(leadTimeRes)
              ? leadTimeRes
              : [],
        });
      } catch (error) {
        console.error(
          "Erro ao carregar gráficos de Relatórios na Home:",
          error
        );
      }
    };

    fetchReportCharts();

    return () => {
      mounted = false;
    };
  }, [defaultDates]);

  /*
   * ============================================================
   * GRÁFICOS
   * ============================================================
   */

  const charts = [
    /*
     * ----------------------------------------------------------
     * 1 — HOME
     * ----------------------------------------------------------
     */

    {
      id: "materials",
      element: <MaterialsChart />,
    },

    /*
     * ----------------------------------------------------------
     * 2 — HOME
     * ----------------------------------------------------------
     */

    {
      id: "waste",
      element: <MaterialsWasteChart />,
    },

    /*
     * ----------------------------------------------------------
     * 3 — HOME
     * ----------------------------------------------------------
     */

    {
      id: "projects",
      element: <ProjectsChart />,
    },

    /*
     * ----------------------------------------------------------
     * 4 — HOME
     * ----------------------------------------------------------
     */

    {
      id: "employees",
      element: <EmployeesChart />,
    },

    /*
     * ----------------------------------------------------------
     * 5 — RELATÓRIOS
     * ----------------------------------------------------------
     */

    {
      id: "report-evolution",
      element: (
        <ProjectEvolutionGraph
          categories={
            reportData.evolution.categories
          }
          series={
            reportData.evolution.series
          }
        />
      ),
    },

    /*
     * ----------------------------------------------------------
     * 6 — RELATÓRIOS
     * ----------------------------------------------------------
     */

    {
      id: "report-consumption",
      element: (
        <TotalConsumptionGraph
          data={reportData.consumption}
        />
      ),
    },

    /*
     * ----------------------------------------------------------
     * 7 — RELATÓRIOS
     * ----------------------------------------------------------
     */

    {
      id: "report-leadtime",
      element: (
        <LeadTimeGraph
          data={reportData.leadTime}
        />
      ),
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
            onOpen={() =>
              setOpenedKpi("planejado")
            }
          />

          <DataPanel
            title="Processado"
            value={kpiData.processado_kg}
            unit="KG"
            onOpen={() =>
              setOpenedKpi("processado")
            }
          />

          <DataPanel
            title="Refugo"
            value={kpiData.refugo_kg}
            unit="KG"
            onOpen={() =>
              setOpenedKpi("refugo")
            }
          />
        </div>

        {/* =================================================
            7 GRÁFICOS
        ================================================== */}

        <DashboardChartGrid charts={charts} />
      </div>

      {/* =====================================================
          GRÁFICOS DOS KPIs
          
          O histórico não é inventado aqui.
          Quando o getHomeKPIs() fornecer os dados históricos,
          eles poderão ser passados diretamente ao modal.
      ====================================================== */}

      <KpiChartModal
        isOpen={openedKpi === "planejado"}
        onClose={() => setOpenedKpi(null)}
        title="Planejado"
        value={kpiData.planejado_kg}
        unit="KG"
      />

      <KpiChartModal
        isOpen={openedKpi === "processado"}
        onClose={() => setOpenedKpi(null)}
        title="Processado"
        value={kpiData.processado_kg}
        unit="KG"
      />

      <KpiChartModal
        isOpen={openedKpi === "refugo"}
        onClose={() => setOpenedKpi(null)}
        title="Refugo"
        value={kpiData.refugo_kg}
        unit="KG"
      />
    </div>
  );
}

export default Home;