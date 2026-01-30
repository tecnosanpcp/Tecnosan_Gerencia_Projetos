// Import de funções
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

// Import de componentes especificos a esta página
import BudgetEquipmentTable from "./BudgetEquipmentsTable";
import BudgetTimeline from "./BudgetTimeline";
import NewEquipmentModal from "../../Ui/newEquipmentModal";
import BudgetAccessories from "./BudgetAccessories";

// Iport Services
import {
  getTasksTimeline,
  getEquipmentsTimeline,
  getProjectsTimeline,
} from "@services/ViewsSummary.js";
import { readEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { createRelation } from "@services/BudgetsEquipRecipesServices.js";
import { VerifyAuth } from "@services/AuthService.js";

// Telas
const viewLoader = (
  user_id,
  currentBudget,
  allBudgets,
  searchTerm,
  view,
  timelineTasks,
  timelineEquipments,
  timelineBudgets
) => {
  switch (view) {
    case "equipments":
      return (
        <BudgetEquipmentTable
          user_id={user_id}
          currentBudget={currentBudget}
          allBudgets={allBudgets}
          searchTerm={searchTerm}
          timelineTasks={timelineTasks}
          timelineEquipments={timelineEquipments}
        />
      );
    case "timeline":
      return (
        <BudgetTimeline
          user_id={user_id}
          currentBudget={currentBudget}
          allBudgets={allBudgets}
          searchTerm={searchTerm}
          timelineTasks={timelineTasks}
          timelineEquipments={timelineEquipments}
          timelineBudgets={timelineBudgets}
        />
      );
    // --- NOVO CASE ---
    case "accessories":
      return (
        <BudgetAccessories
          currentBudget={currentBudget}
          allBudgets={allBudgets}
          searchTerm={searchTerm}
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

export default function BudgetsMain({ currentBudget, allBudgets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");
  const [isVisible, setVisible] = useState(false);

  const [timelineTasks, setTimelineTasks] = useState([]);
  const [timelineEquipments, setTimelineEquipments] = useState([]);
  const [timelineBudgets, setTimelineBudgets] = useState([]);
  const [equipmentsRecipes, setEquipmentsRecipes] = useState([]);
  const [userId, setUserId] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          timelineTasksData,
          timelineEquimentData,
          timelineBudgetsData,
          userData,
          equipmentsData,
        ] = await Promise.all([
          getTasksTimeline(),
          getEquipmentsTimeline(),
          getProjectsTimeline(),
          VerifyAuth(),
          readEquipmentRecipe(),
        ]);
        setTimelineTasks(timelineTasksData);
        setTimelineEquipments(timelineEquimentData);
        setTimelineBudgets(timelineBudgetsData);
        if (userData) setUserId(userData.user_id);
        setEquipmentsRecipes(equipmentsData);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  return (
    <React.Fragment>
      <main className="card m-0 p-4 gap-4 overflow-y-auto" key={1}>
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
            {currentBudget && (
                <button
                className="bnt-add"
                onClick={() => {
                    setVisible(true);
                }}
                >
                + Novo Equipamento
                </button>
            )}
            
            {btnView(view, setView, "equipments", "Equipamentos")}
            {btnView(view, setView, "timeline", "Cronograma")}
            {btnView(view, setView, "accessories", "Acessórios")}
          </div>
        </div>

        {viewLoader(
          userId,
          currentBudget,
          allBudgets,
          searchTerm,
          view,
          timelineTasks,
          timelineEquipments,
          timelineBudgets
        )}
      </main>

      <NewEquipmentModal
        key={2}
        isVisible={isVisible}
        onClose={() => setVisible(false)}
        onConfirm={async (selectedRecipe, quantity) => {
          try {
            await createRelation(currentBudget?.id, selectedRecipe, quantity);
          } catch (error) {
            console.error(error);
          }
        }}
        recipesList={equipmentsRecipes}
      />
    </React.Fragment>
  );
}