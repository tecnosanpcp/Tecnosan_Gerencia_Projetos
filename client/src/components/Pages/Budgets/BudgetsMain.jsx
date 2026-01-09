// Import de funções
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

// Import de componentes especificos a esta página
import BudgetEquipmentTable from "./BudgetEquipmentsTable";
import BudgetTimeline from "./BudgetTimeline";

// Iport Services
import {
  getTasksTimeline,
  getEquipmentsTimeline,
  getProjectsTimeline,
} from "@services/ViewsSummary.js";

const viewLoader = (
  currentBudget,
  searchTerm,
  view,
  timelineTasks,
  timelineEquipments,
  timelineBudgets
) => {
  if (!currentBudget) return <h1>Escolha um projeto</h1>;

  switch (view) {
    case "equipments":
      return (
        <BudgetEquipmentTable
          currentBudget={currentBudget}
          searchTerm={searchTerm}
          timelineTasks={timelineTasks}
          timelineEquipments={timelineEquipments}
        />
      );
    case "timeline":
      return (
        <BudgetTimeline
          currentBudget={currentBudget}
          searchTerm={searchTerm}
          timelineTasks={timelineTasks}
          timelineEquipments={timelineEquipments}
          timelineBudgets={timelineBudgets}
        />
      );
    default:
      return <h1>Escolha uma tela</h1>;
  }
};

const btnView = (view, setView, label, text) => {
  if (view != label) {
    return (
      <button className="bnt" onClick={() => setView(label)}>
        Ir para {text}
      </button>
    );
  }
};

export default function BudgetsMain({ currentBudget }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");

  const [timelineTasks, setTimelineTasks] = useState([]);
  const [timelineEquipments, setTimelineEquipments] = useState([]);
  const [timelineBudgets, setTimelineBudgets] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const timelineTasksData = await getTasksTimeline();
      setTimelineTasks(timelineTasksData);

      const timelineEquimentData = await getEquipmentsTimeline();
      setTimelineEquipments(timelineEquimentData);

      const timelineBudgetsData = await getProjectsTimeline();
      setTimelineBudgets(timelineBudgetsData);
    };
    loadData();
  }, []);

  return (
    <main className="card m-0 p-4 gap-4 overflow-y-auto">
      {/* Barra de Pesquisa */}
      <div className="flex flex-row justify-between w-full">
        <form
          className="flex flex-row justify-between space-x-4 p-2 rounded-xl bg-white-gray h-fit"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <button>
            <FaSearch />
          </button>
          <input
            type="text"
            placeholder="Pesquisar equipamento"
            className="bg-transparent"
            value={searchTerm}
            onChange={(e) => {
              e.preventDefault();
              setSearchTerm(e.target.value);
            }}
          />
        </form>

        {/* Botões de ações */}
        <div className="flex flex-row justify-center gap-4 h-fit">
          <button className="bnt-add">+ Novo Equipamento</button>
          {btnView(view, setView, "equipments", "Equipamentos")}
          {btnView(view, setView, "timeline", "Cronograma")}
          {btnView(view, setView, "accessories", "Acessórios")}
        </div>
      </div>

      {viewLoader(
        currentBudget,
        searchTerm,
        view,
        timelineTasks,
        timelineEquipments,
        timelineBudgets
      )}
    </main>
  );
}
