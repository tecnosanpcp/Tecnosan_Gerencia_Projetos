import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Componentes
import NewEquipmentModal from "../../Ui/newEquipmentModal";
import BudgetEquipmentTable from "./BudgetEquipmentsTable";
import BudgetTimeline from "./BudgetTimeline";
import BudgetAccessories from "./BudgetAccessories";

// Services
import { readEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { getTasksTimeline, getEquipmentsTimeline, getProjectsTimeline } from "@services/ViewsSummary.js";
import { createBudgetEquipment,listBudgetEquipments } from "@services/BudgetsEquipmentsService.js"
import { VerifyAuth } from "@services/AuthService.js";
import { vwEquipmentRecipesMaterialSummary, vwComponentRecipeMaterialsSummary } from "@services/ViewsService.js";
import { listBudgetComponentSchedule } from "@services/BudgetsComponentsScheduleService.js"

export default function BudgetsMain({ currentBudget, allBudgets }) {
  const [isVisible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments")

  const budgetDetailsQuery = useQuery({
    queryKey: ["budgetDetails", currentBudget?.id || "all"],
    queryFn: async () => {
      const budgetsToProcess = currentBudget ? [currentBudget] : (allBudgets || []);
      const results = [];
      for (const bud of budgetsToProcess) {
        const id = bud.id;
        if (!id) continue;
        const [equipSummary, compSummary] = await Promise.all([
          vwEquipmentRecipesMaterialSummary(id),
          vwComponentRecipeMaterialsSummary(id),
        ]);
        results.push({
          budget_id: id,
          budget_name: bud.budget_name,
          status: bud.status,
          equipments: equipSummary || [],
          components: compSummary || []
        });
      }
      return results;
    },
    enabled: !!currentBudget || (allBudgets?.length > 0),
  });

  const budgetEquipments = useQuery({
    queryKey: ["recipesEquipmentsList", "all", currentBudget?.id],
    queryFn: async () => {
      if (!currentBudget.id) return []
      return await listBudgetEquipments(currentBudget?.id)
    },
  })

  const recipesEquipmentsList = useQuery({
    queryKey: ["budgetEquipments"],
    queryFn: readEquipmentRecipe,
  })

  const renderView = () => {
    const commonProps = {
      currentBudget,
      allBudgets,
      searchTerm,
      groupedData: budgetDetailsQuery.data || [],
      timelineTasks: [],
      timelineEquipments: [],
    };

    switch (view) {
      case "equipments": return <BudgetEquipmentTable {...commonProps} />;
      case "timeline": return <BudgetTimeline {...commonProps} timelineBudgets={[]} />;
      case "accessories": return <BudgetAccessories {...commonProps} />;
      default: return <h1>Escolha uma tela</h1>;
    }
  };

  useEffect(()=>console.log(budgetDetailsQuery.data), [budgetDetailsQuery])
  
  return(
  <React.Fragment>  
    <main className="card m-0 p-4 gap-4 overflow-y-auto">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row items-center space-x-4 p-2 rounded-xl bg-gray-100 h-fit">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar equipamento"
            className="bg-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-4 h-fit">
          {currentBudget && (
            <button className="bnt-add" onClick={() => setVisible(true)}>
              + Novo Equipamento
            </button>
          )}
          <button className={`bnt ${view === 'equipments' ? 'bg-blue-100' : ''}`} onClick={() => setView("equipments")}>Equipamentos</button>
          <button className={`bnt ${view === 'timeline' ? 'bg-blue-100' : ''}`} onClick={() => setView("timeline")}>Cronograma</button>
          <button className={`bnt ${view === 'accessories' ? 'bg-blue-100' : ''}`} onClick={() => setView("accessories")}>Acessórios</button>
        </div>
      </div>

      {renderView()}

    </main>
    <NewEquipmentModal
      isVisible={isVisible}
      onClose={() => setVisible(false)}
      onConfirm={ async (equipment_recipe_id, quantity)=>{
        for (let i = 0; i < quantity; i++){
          await createBudgetEquipment(
            currentBudget?.id, 
            equipment_recipe_id
          );}}}
      recipesList={recipesEquipmentsList.data || []}
    />
  </React.Fragment>
  );
}