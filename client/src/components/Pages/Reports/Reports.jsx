import { useState, useEffect, useCallback } from "react";

// UI Components
import NavBar from "../../Ui/NavBar";
import CascadeTable from "../../Ui/CascadeTable";
import CascadeTableTwoLevel from "../../Ui/CascadeTableTwoLevel";
import InfoCard from "../../Ui/InfoCard";
import SelectMenu from "../../Ui/SelectMenu";
import ProjectEvolutionGraph from "./ProjectEvolutionGraph";
import TotalConsumptionGraph from "./TotalConsumptionGraph";

// Services
import { listProjects } from "@services/ProjectService";
import { getEquipment } from "@services/EquipmentService";
import { VerifyAuth } from "@services/AuthService";
import {
  countStatusComponents,
  countStatusComponentsByProj,
} from "@services/ComponentsServices";
import {
  vwProjectConsumedMaterials,
  vwProjectDepartmentDelays,
} from "@services/ViewsService";

// Utils
import { getDefaultDateRange, formatDateForApi } from "../../../utils/dateUtils";

// Assets
import imgEntrega from "../../../imgs/entrega.png";
import imgCaixa from "../../../imgs/caixa.png";
import imgDesperdicio from "../../../imgs/desperdicio.png";

export default function Reports() {
  // --- Estados de Filtros ---
  const defaultDates = getDefaultDateRange(3);
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [selectedProj, setSelectedProj] = useState([1]);
  const [selectedEquip, setSelectedEquip] = useState([]);

  // --- Estados de Dados (Listas) ---
  const [projects, setProjects] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [dataConsumedMaterials, setDataConsumedMaterials] = useState([]);
  const [processDelaysList, setProcessDelaysList] = useState([]);

  // --- Estados de Métricas e Gráficos ---
  const [countStatusGraph, setCountStatusGraph] = useState([]);
  const [metrics, setMetrics] = useState({ completed: 0, pending: 0 });

  // --- Funções de Busca (Data Fetching) ---

  // 1. Dados Estáticos (Carregados uma vez)
  const fetchStaticData = async (userId) => {
    try {
      const [projData, equipData, delayData, materialData] = await Promise.all([
        listProjects(userId),
        getEquipment(userId),
        vwProjectDepartmentDelays(),
        vwProjectConsumedMaterials(userId),
      ]);

      setProjects(projData || []);
      setEquipments(equipData || []);
      setProcessDelaysList(delayData || []);
      
      if (Array.isArray(materialData)) {
        setDataConsumedMaterials(materialData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  };

  // 2. Dados Dinâmicos (Dependem dos filtros)
  const fetchDashboardMetrics = useCallback(async () => {
    // Evita chamadas desnecessárias se não tiver projeto selecionado
    const projId = selectedProj[0];
    const equipId = selectedEquip[0]; // Pode ser null/undefined

    if (!projId) return;

    try {
      const formattedStart = formatDateForApi(startDate);
      const formattedEnd = formatDateForApi(endDate);

      // Busca paralela para otimizar performance
      const [graphResponse, cardsResponse] = await Promise.all([
        countStatusComponentsByProj(projId, equipId, formattedStart, formattedEnd),
        countStatusComponents(projId, equipId, formattedStart, formattedEnd)
      ]);

      setCountStatusGraph(graphResponse || []);
      
      if (cardsResponse && cardsResponse[0]) {
        setMetrics({
          completed: cardsResponse[0].total_completed || 0,
          pending: cardsResponse[0].total_pending || 0
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar métricas do dashboard:", error);
    }
  }, [selectedProj, selectedEquip, startDate, endDate]);

  // --- Efeitos (Side Effects) ---

  // Load Inicial (Autenticação + Listas Básicas)
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const user = await VerifyAuth();
      if (user && isMounted) {
        await fetchStaticData(user.user_id);
      }
    };

    init();
    return () => { isMounted = false; };
  }, []);

  // Atualização dos Gráficos quando filtros mudam
  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  // --- Renderização ---

  return (
    <div className="h-screen w-screen space-y-4 pb-16 bg-gray-50">
      <NavBar select_index={3} />

      {/* Header de Filtros */}
      <div className="flex flex-row bg-white py-1 px-2 items-center justify-between shadow-lg mx-4 rounded">
        <h2 className="font-bold text-lg">Dashboard</h2>
        
        <div className="flex flex-row space-x-2 items-end">
          {/* Filtro Projeto */}
          <div>
            <p className="text-xs text-gray-600 mb-1">Projetos</p>
            <SelectMenu
              className="h-6"
              maxSelections={1}
              options={projects.map((p) => ({ id: p.project_id, label: p.project_name }))}
              selectedOption={selectedProj}
              setSelectedOption={setSelectedProj}
            />
          </div>

          {/* Filtro Equipamento */}
          <div>
            <p className="text-xs text-gray-600 mb-1">Equipamento</p>
            <SelectMenu
              className="h-6"
              maxSelections={1}
              options={equipments.map((e) => ({ id: e.equipment_id, label: e.equipment_name }))}
              selectedOption={selectedEquip}
              setSelectedOption={setSelectedEquip}
            />
          </div>

          {/* Filtro Data */}
          <div className="flex flex-col">
            <p className="self-center text-xs text-gray-600 mb-1">Período</p>
            <div className="flex flex-row space-x-2">
              <input
                type="date"
                className="bg-gray-100 p-1 rounded-md text-xs border border-gray-300"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="bg-gray-100 p-1 rounded-md text-xs border border-gray-300"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-12 gap-4 mx-4">
        
        {/* Linha 1: Cards + Gráfico Principal */}
        <div className="col-span-7 bg-white p-4 rounded shadow-lg flex flex-row">
          <div className="flex flex-col space-y-6 w-1/4 pr-4 border-r border-gray-100">
            <InfoCard
              title="Entregues"
              value={metrics.completed}
              icon={<img src={imgEntrega} className="w-6 h-6" alt="Entregues" />}
            />
            <InfoCard
              title="Peças Pendentes"
              value={metrics.pending}
              icon={<img src={imgCaixa} className="w-6 h-6" alt="Pendentes" />}
            />
            <InfoCard
              title="Desperdício"
              value={0}
              icon={<img src={imgDesperdicio} className="w-6 h-6" alt="Desperdício" />}
            />
          </div>
          <div className="w-3/4 pl-4 h-full">
            <ProjectEvolutionGraph data={countStatusGraph} />
          </div>
        </div>

        {/* Linha 1: Tabela de Materiais */}
        <div className="col-span-5 h-96 bg-white p-2 rounded shadow-lg overflow-hidden flex flex-col">
           <CascadeTable
            title="Detalhamento por Projeto"
            headers={["Equipamentos", "Valores"]}
            filter={dataConsumedMaterials.map((p) => p.material_name)}
            values={dataConsumedMaterials}
          />
        </div>

        {/* Linha 2: Outros Gráficos e Tabelas */}
        <div className="col-span-4 bg-white p-2 rounded shadow-lg h-96">
          <TotalConsumptionGraph data={dataConsumedMaterials} />
        </div>

        <div className="col-span-4 bg-white p-2 rounded shadow-lg h-96 flex items-center justify-center">
          <h1 className="text-gray-400 font-semibold">Lead Time Meta X Real (Em Breve)</h1>
        </div>

        <div className="col-span-4 bg-white p-2 rounded shadow-lg h-96 overflow-y-auto">
          <CascadeTableTwoLevel
            title="Processos em Atraso por Departamento"
            data={processDelaysList.map((data) => ({
              component_id: data.component_id,
              component_name: data.component_name,
              department_id: data.department_id,
              department_name: data.department_name,
              // Usa operador de encadeamento opcional para segurança
              days_late: data.total_delay_time?.days || 0, 
            }))}
          />
        </div>
      </div>
    </div>
  );
}