import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Componentes
import BudgetEquipmentTable from "./BudgetEquipmentsTable";
import BudgetTimeline from "./BudgetTimeline";
import NewEquipmentModal from "../../Ui/newEquipmentModal";
import BudgetAccessories from "./BudgetAccessories";

// Services
import { getTasksTimeline, getEquipmentsTimeline, getProjectsTimeline } from "@services/ViewsSummary.js";
import { readEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { createRelation } from "@services/BudgetsEquipRecipesServices.js";
import { VerifyAuth } from "@services/AuthService.js";
import { vwEquipmentRecipesMaterialSummary, vwComponentRecipeMaterialsSummary } from "@services/ViewsService.js";

export default function BudgetsMain({ currentBudget, allBudgets }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");
  const [isVisible, setVisible] = useState(false);

  // ==========================================
  // 1. QUERIES PADRONIZADAS (CACHE GLOBAL)
  // ==========================================

  const { data: userData } = useQuery({ 
    queryKey: ["authUser"], 
    queryFn: VerifyAuth, 
    staleTime: Infinity 
  });

  const tasksQuery = useQuery({ 
    queryKey: ["timelineTasks"], 
    queryFn: getTasksTimeline 
  });

  const equipTimelineQuery = useQuery({ 
    queryKey: ["timelineEquipments"], 
    queryFn: getEquipmentsTimeline 
  });

  const budgetsTimelineQuery = useQuery({ 
    queryKey: ["timelineBudgets"], 
    queryFn: getProjectsTimeline 
  });

  const recipesQuery = useQuery({ 
    queryKey: ["equipmentRecipes"], 
    queryFn: readEquipmentRecipe 
  });

  // Query detalhada dos materiais do orçamento
  const budgetDetailsQuery = useQuery({
    queryKey: ["budgetDetails", currentBudget?.id || currentBudget?.budget_id || "all"],
    queryFn: async () => {
      const budgetsToProcess = currentBudget ? [currentBudget] : (allBudgets || []);
      const results = [];
      for (const bud of budgetsToProcess) {
        const id = bud.id || bud.budget_id;
        if (!id) continue;
        const [equipSummary, compSummary] = await Promise.all([
          vwEquipmentRecipesMaterialSummary(id),
          vwComponentRecipeMaterialsSummary(id),
        ]);
        results.push({
          budget_id: id,
          budget_name: bud.name || bud.budget_name,
          status: bud.status,
          equipments: equipSummary || [],
          components: compSummary || []
        });
      }
      return results;
    },
    enabled: !!currentBudget || (allBudgets?.length > 0),
  });

  // ==========================================
  // 2. MUTAÇÃO (CREATE RELATION)
  // ==========================================
  const addEquipMutation = useMutation({
    mutationFn: ({ budgetId, recipeId, qty }) => createRelation(budgetId, recipeId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetDetails"] });
      queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
      queryClient.invalidateQueries({ queryKey: ["timelineEquipments"] });
      setVisible(false);
    }
  });

  const renderView = () => {
    const commonProps = {
      user_id: userData?.user_id,
      currentBudget,
      allBudgets,
      searchTerm,
      groupedData: budgetDetailsQuery.data || [],
      timelineTasks: tasksQuery.data || [],
      timelineEquipments: equipTimelineQuery.data || [],
    };

    switch (view) {
      case "equipments": return <BudgetEquipmentTable {...commonProps} />;
      case "timeline": return <BudgetTimeline {...commonProps} timelineBudgets={budgetsTimelineQuery.data || []} />;
      case "accessories": return <BudgetAccessories {...commonProps} />;
      default: return <h1>Escolha uma tela</h1>;
    }
  };

  return (
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

        {budgetDetailsQuery.isLoading ? (
          <div className="text-center p-10">Sincronizando PCP...</div>
        ) : (
          renderView()
        )}
      </main>

      <NewEquipmentModal
        isVisible={isVisible}
        onClose={() => setVisible(false)}
        onConfirm={(selectedRecipe, quantity) => {
          addEquipMutation.mutate({
            budgetId: currentBudget?.id || currentBudget?.budget_id,
            recipeId: selectedRecipe,
            qty: quantity
          });
        }}
        recipesList={recipesQuery.data || []}
      />
    </React.Fragment>
  );
}