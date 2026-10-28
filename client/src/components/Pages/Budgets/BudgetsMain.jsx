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
import { createBudgetEquipment } from "@services/BudgetsEquipmentsService.js";
import {
  vwEquipmentRecipesMaterialSummary,
  vwComponentRecipeMaterialsSummary,
} from "@services/ViewsService.js";

import {
  getTasksTimeline,
  getEquipmentsTimeline,
  getProjectsTimeline,
} from "@services/ViewsSummary.js";

export default function BudgetsMain({ currentBudget, allBudgets }) {
  const [isVisible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");
  // ATUALIZAÇÃO AUTOMÁTICA DOS EQUIPAMENTOS:
  // Permite avisar ao React Query quando os dados do orçamento
  // precisam ser consultados novamente, sem atualizar a página inteira.
  const queryClient = useQueryClient();

  const recipesQuery = useQuery({
    queryKey: ["equipmentRecipes"],
    queryFn: async () => {
      return await readEquipmentRecipe();
    },
  });

  const tasksQuery = useQuery({
    queryKey: ["timelineTasks"],
    queryFn: getTasksTimeline,
  });

  const equipTimelineQuery = useQuery({
    queryKey: ["timelineEquipments"],
    queryFn: getEquipmentsTimeline,
  });

  const budgetsTimelineQuery = useQuery({
    queryKey: ["timelineBudgets"],
    queryFn: getProjectsTimeline,
  });

  const budgetDetailsQuery = useQuery({
    queryKey: ["budgetDetails", currentBudget?.id || "all"],
    queryFn: async () => {
      const budgetsToProcess = currentBudget
        ? [currentBudget]
        : allBudgets || [];
      const results = [];
      for (const bud of budgetsToProcess) {
        const id = bud.id || bud.budget_id;
        if (!id) continue;
        const [equipSummary, compSummary] = await Promise.all([
          vwEquipmentRecipesMaterialSummary(id),
          vwComponentRecipeMaterialsSummary(id),
        ]);
        console.log[(equipSummary, compSummary)];
        results.push({
          budget_id: id,
          budget_name: bud.name || bud.budget_name,
          status: bud.status,
          equipments: equipSummary || [],
          components: compSummary || [],
        });
      }
      return results;
    },
    enabled: !!currentBudget || allBudgets?.length > 0,
  });

  const renderView = () => {
    const commonProps = {
      currentBudget,
      allBudgets,
      searchTerm,
      groupedData: budgetDetailsQuery.data || [],
      timelineTasks: tasksQuery.data || [],
      timelineEquipments: equipTimelineQuery.data || [],
    };

    switch (view) {
      case "equipments":
        return <BudgetEquipmentTable {...commonProps} />;
      case "timeline":
        return (
          <BudgetTimeline
            {...commonProps}
            timelineBudgets={budgetsTimelineQuery.data || []}
          />
        );
      case "accessories":
        return <BudgetAccessories {...commonProps} />;
      default:
        return <h1>Escolha uma tela</h1>;
    }
  };

  useEffect(() => console.log(budgetDetailsQuery.data));

  return (
    <React.Fragment>
      <main className="min-w-0 overflow-hidden border border-[#DFE1E6] bg-white">
        <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-9 min-w-0 w-full items-center gap-2 rounded border border-[#DFE1E6] bg-white px-3 lg:max-w-[360px] xl:max-w-[420px]">
            <FaSearch className="shrink-0 text-xs text-[#6B778C]" />

            <input
              type="text"
              placeholder="Pesquisar equipamento"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#172B4D] outline-none placeholder:text-[#7A869A]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2">
            {currentBudget && (
              <button
                type="button"
                className="h-8 rounded border border-[#0052CC] bg-[#0052CC] px-3 text-xs font-medium text-white hover:bg-[#0747A6] sm:text-sm"
                onClick={() => setVisible(true)}
              >
                + Novo Equipamento
              </button>
            )}

            <div className="flex min-w-0 overflow-hidden rounded border border-[#DFE1E6]">
              {[
                { value: "equipments", label: "Equipamentos" },
                { value: "timeline", label: "Cronograma" },
                { value: "accessories", label: "Acessórios" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setView(tab.value)}
                  className={`h-8 px-2 text-xs font-medium transition sm:px-3 sm:text-sm ${
                    view === tab.value
                      ? "bg-[#DEEBFF] text-[#0052CC]"
                      : "bg-white text-[#5E6C84] hover:bg-[#F4F5F7]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden">
          {budgetDetailsQuery.isLoading ? (
            <div className="text-center p-10">Sincronizando PCP...</div>
          ) : (
            renderView()
          )}
        </div>
      </main>

      <NewEquipmentModal
        isVisible={isVisible}
        onClose={() => setVisible(false)}
        onConfirm={async (selectedRecipe, quantity) => {
          // Mantemos a lógica original de criação:
          // cada unidade solicitada gera um equipamento individual no banco.
          for (let q = 0; q < quantity; q++) {
            await createBudgetEquipment(currentBudget.id, selectedRecipe);
          }

          // Após o backend concluir os cadastros, atualizamos somente
          // os dados do orçamento selecionado.
          // Isso evita precisar trocar de página ou pressionar F5.
          await queryClient.invalidateQueries({
            queryKey: ["budgetDetails", currentBudget.id],
            exact: true,
          });

          // Atualizamos também a consulta geral, caso esteja em cache.
          // Isso mantém a visualização de todos os orçamentos consistente.
          await queryClient.invalidateQueries({
            queryKey: ["budgetDetails", "all"],
            exact: true,
          });
        }}
        recipesList={recipesQuery.data || []}
      />
    </React.Fragment>
  );
}
