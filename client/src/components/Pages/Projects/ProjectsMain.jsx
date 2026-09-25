import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import ProjectEquipmentsTable from "./ProjectEquipmentsTable";
import ProjectAccessoriesTable from "./ProjectAccessoriesTable";
import ProjectTimeline from "./ProjectTimeline";

import NewEquipmentModal from "../../Ui/newEquipmentModal";

import {
  readEquipmentRecipe,
  createEquipmentRecipe,
} from "@services/EquipmentRecipesService.js";

import {
  vwProjectMaterialsSummary,
  vwSummaryStatus,
} from "@services/ViewsSummary.js";

import { VerifyAuth } from "@services/AuthService.js";

export default function ProjectsMain({ times }) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("equipments");
  const [modalVisible, setModalVisible] = useState(false);

  const recipesQuery = useQuery({
    queryKey: ["equipmentRecipes"],
    queryFn: readEquipmentRecipe,
  });

  const materialsSummaryQuery = useQuery({
    queryKey: ["projectMaterialsSummary"],
    queryFn: async () => {
      const user = await VerifyAuth();
      return vwProjectMaterialsSummary(user.user_id);
    },
  });

  const statusSummaryQuery = useQuery({
    queryKey: ["projectStatusSummary"],
    queryFn: vwSummaryStatus,
  });

  const addEquipMutation = useMutation({
    mutationFn: async ({ recipe, quantity }) => {
      const promises = Array.from(
        { length: quantity },
        () => createEquipmentRecipe(recipe)
      );

      await Promise.all(promises);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectsList"],
      });

      queryClient.invalidateQueries({
        queryKey: ["projectTimesCascade"],
      });

      queryClient.invalidateQueries({
        queryKey: ["projectMaterialsSummary"],
      });

      queryClient.invalidateQueries({
        queryKey: ["projectStatusSummary"],
      });

      setModalVisible(false);
    },
  });

  const renderView = () => {
    const commonProps = {
      searchTerm,
      times: times ?? {},
      materialsSummary: materialsSummaryQuery.data || [],
      statusSummary: statusSummaryQuery.data || {},
    };

    switch (view) {
      case "equipments":
        return <ProjectEquipmentsTable {...commonProps} />;

      case "timeline":
        return <ProjectTimeline {...commonProps} />;

      case "accessories":
        return <ProjectAccessoriesTable {...commonProps} />;

      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <main
        className="
          min-w-0
          overflow-hidden
          
          border border-[#DFE1E6]
          bg-white
          
        "
      >
        {/* Toolbar */}
        <div
          className="
            flex
            flex-col
            gap-3
            border-b-0
            border-[#DFE1E6]
            p-3
            sm:p-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* Pesquisa */}
          <div
            className="
              flex
              h-9
              min-w-0
              w-full
              items-center
              gap-2
              rounded
              border
              border-[#DFE1E6]
              bg-white
              px-3
              lg:max-w-[360px]
              xl:max-w-[420px]
            "
          >
            <FaSearch className="shrink-0 text-xs text-[#6B778C]" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Pesquisar..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-[#172B4D]
                outline-none
                placeholder:text-[#7A869A]
              "
            />
          </div>

          {/* Ações */}
          <div
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-1
              sm:gap-2
            "
          >
            {view === "equipments" && (
              <button
                type="button"
                onClick={() => setModalVisible(true)}
                className="
                  h-8
                  rounded
                  border
                  border-[#0052CC]
                  bg-[#0052CC]
                  px-3
                  text-xs
                  font-medium
                  text-white
                  hover:bg-[#0747A6]
                  sm:text-sm
                "
              >
                + Novo Equipamento
              </button>
            )}

            <div className="flex min-w-0 overflow-hidden rounded border border-[#DFE1E6]">
              <button
                type="button"
                onClick={() => setView("equipments")}
                className={`
                  h-8
                  px-2
                  text-xs
                  font-medium
                  transition
                  sm:px-3
                  sm:text-sm
                  ${
                    view === "equipments"
                      ? "bg-[#DEEBFF] text-[#0052CC]"
                      : "bg-white text-[#5E6C84] hover:bg-[#F4F5F7]"
                  }
                `}
              >
                Equipamentos
              </button>

              <button
                type="button"
                onClick={() => setView("timeline")}
                className={`
                  h-8
                  px-2
                  text-xs
                  font-medium
                  transition
                  sm:px-3
                  sm:text-sm
                  ${
                    view === "timeline"
                      ? "bg-[#DEEBFF] text-[#0052CC]"
                      : "bg-white text-[#5E6C84] hover:bg-[#F4F5F7]"
                  }
                `}
              >
                Cronograma
              </button>

              <button
                type="button"
                onClick={() => setView("accessories")}
                className={`
                  h-8
                  px-2
                  text-xs
                  font-medium
                  transition
                  sm:px-3
                  sm:text-sm
                  ${
                    view === "accessories"
                      ? "bg-[#DEEBFF] text-[#0052CC]"
                      : "bg-white text-[#5E6C84] hover:bg-[#F4F5F7]"
                  }
                `}
              >
                Acessórios
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 overflow-hidden">
          {materialsSummaryQuery.isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center p-6 text-sm text-[#6B778C]">
              Carregando execução...
            </div>
          ) : (
            renderView()
          )}
        </div>
      </main>

      <NewEquipmentModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(recipe, quantity) =>
          addEquipMutation.mutate({
            recipe,
            quantity,
          })
        }
        recipesList={recipesQuery.data || []}
      />
    </React.Fragment>
  );
}