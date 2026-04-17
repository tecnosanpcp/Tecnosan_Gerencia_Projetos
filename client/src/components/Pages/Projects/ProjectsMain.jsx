import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Componentes
import ProjectEquipmentsTable from "./ProjectEquipmentsTable";
import ProjectAccessoriesTable from "./ProjectAccessoriesTable";
import ProjectTimeline from "./ProjectTimeline";
import NewEquipmentModal from "../../Ui/newEquipmentModal";

// Services
import { readEquipmentRecipe, createEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { vwProjectMaterialsSummary, vwSummaryStatus } from "@services/ViewsSummary.js";
import { VerifyAuth } from "@services/AuthService.js";

export default function ProjectsMain({ times }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");
  const [modalVisible, setModalVisible] = useState(false);

  // ==========================================
  // 1. QUERIES CENTRALIZADAS
  // ==========================================
  
  // Lista de Receitas para o Modal
  const recipesQuery = useQuery({
    queryKey: ["equipmentRecipes"],
    queryFn: readEquipmentRecipe
  });

  // Resumo de Materiais (Consumo Real)
  const materialsSummaryQuery = useQuery({
    queryKey: ["projectMaterialsSummary"],
    queryFn: async () => {
      const user = await VerifyAuth();
      return vwProjectMaterialsSummary(user.user_id);
    }
  });

  // Status dos Componentes e Equipamentos
  const statusSummaryQuery = useQuery({
    queryKey: ["projectStatusSummary"],
    queryFn: vwSummaryStatus
  });

  // ==========================================
  // 2. MUTAÇÃO PARA NOVO EQUIPAMENTO
  // ==========================================
  const addEquipMutation = useMutation({
    mutationFn: async ({ recipe, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        await createEquipmentRecipe(recipe);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMaterialsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["projectStatusSummary"] });
      setModalVisible(false);
    }
  });

  const renderView = () => {
    const commonProps = {
      searchTerm,
      times: times ?? {},
      materialsSummary: materialsSummaryQuery.data || [],
      statusSummary: statusSummaryQuery.data || {},
    };

    switch (view) {
      case "equipments": return <ProjectEquipmentsTable {...commonProps} />;
      case "timeline": return <ProjectTimeline {...commonProps} />;
      case "accessories": return <ProjectAccessoriesTable {...commonProps} />;
      default: return null;
    }
  };

  return (
    <React.Fragment>
      <main className="card m-0 p-4 gap-4 overflow-y-auto">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-row items-center space-x-4 p-2 rounded-xl bg-gray-100 h-fit">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-4 h-fit">
            {view === "equipments" && (
              <button className="bnt-add" onClick={() => setModalVisible(true)}>
                + Novo Equipamento
              </button>
            )}
            <button className={`bnt ${view === 'equipments' ? 'bg-blue-100' : ''}`} onClick={() => setView("equipments")}>Equipamentos</button>
            <button className={`bnt ${view === 'timeline' ? 'bg-blue-100' : ''}`} onClick={() => setView("timeline")}>Cronograma</button>
            <button className={`bnt ${view === 'accessories' ? 'bg-blue-100' : ''}`} onClick={() => setView("accessories")}>Acessórios</button>
          </div>
        </div>

        {materialsSummaryQuery.isLoading ? (
          <div className="text-center p-10">Carregando execução...</div>
        ) : (
          renderView()
        )}
      </main>

      <NewEquipmentModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(recipe, quantity) => addEquipMutation.mutate({ recipe, quantity })}
        recipesList={recipesQuery.data || []}
      />
    </React.Fragment>
  );
}