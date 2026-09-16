import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseBRL } from "../../../utils/IntUtils";

import RecipeTable from "./RecipeTable";
import RecipeHeader from "./RecipeHeader";

import { listMaterials } from "@services/MaterialService.js";
import { listAccessories } from "@services/AccessoriesServices.js";
import {
  vwComponentRecipeMaterials,
  vwEquipmentMaterialsSummary,
} from "@services/ViewsService.js";

function Recipes() {
  const [materialsExpanded, setMaterialsExpanded] = useState(false);
  const [accessoriesExpanded, setAccessoriesExpanded] = useState(false);
  const [componentsExpanded, setComponentsExpanded] = useState(false);
  const [equipmentsExpanded, setEquipmentsExpanded] = useState(false);

  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchAccessory, setSearchAccessory] = useState("");
  const [searchComponent, setSearchComponent] = useState("");
  const [searchEquipment, setSearchEquipment] = useState("");

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const safeBRL = (value) => {
    const num = parseFloat(value);

    if (Number.isNaN(num)) {
      return "R$ 0,00";
    }

    return parseBRL(num);
  };

  const safeString = (value) => {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "-";
    }

    return String(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  // =========================================================
  // MATERIAL
  // =========================================================

  const materialsQuery = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const data = await listMaterials();

      return safeArray(data).map((item) => ({
        ID: item?.material_id ?? "-",
        Material: safeString(item?.material_name),
        Descrição: safeString(item?.material_desc),
        "Valor Unitário": `R$ ${safeString(item?.value)} / ${safeString(
          item?.uni
        )}`,
      }));
    },
  });

  // =========================================================
  // ACESSÓRIOS
  // =========================================================

  const accessoriesQuery = useQuery({
    queryKey: ["accessories"],
    queryFn: async () => {
      const data = await listAccessories();

      return safeArray(data).map((item) => ({
        ID: item?.accessory_id ?? "-",
        Acessório: safeString(item?.name),
        "Nº de Série": safeString(item?.serial_number),
        "Data da Compra": formatDate(item?.purchase_date),
        Status: safeString(item?.status),
        Valor: safeBRL(item?.value),
      }));
    },
  });

  // =========================================================
  // COMPONENTES
  // =========================================================

  const componentsQuery = useQuery({
    queryKey: ["components"],
    queryFn: async () => {
      const data = await vwComponentRecipeMaterials();

      return safeArray(data).map((item) => ({
        ID: item?.component_recipe_id ?? "-",
        Componente: safeString(item?.recipe_name),
        "Total Funcionários": item?.qtd_employees ?? 0,
        "Total Horas": item?.qtd_hours ?? 0,
        "Horas-Homens": item?.horas_homem ?? 0,
        "Valor Total": safeBRL(item?.total_value),
      }));
    },
  });

  // =========================================================
  // EQUIPAMENTOS
  // =========================================================

  const equipmentsQuery = useQuery({
    queryKey: ["equipments"],
    queryFn: async () => {
      const data = await vwEquipmentMaterialsSummary();

      return safeArray(data).map((item) => ({
        ID: item?.equipment_recipe_id ?? "-",
        Equipamento: safeString(item?.recipe_name),
        "Horas-Homens": item?.horas_homem ?? 0,
        "Valor Total": safeBRL(item?.total_value),
      }));
    },
  });

  const isLoading =
    materialsQuery.isLoading ||
    accessoriesQuery.isLoading ||
    componentsQuery.isLoading ||
    equipmentsQuery.isLoading;

  const hasError =
    materialsQuery.error ||
    accessoriesQuery.error ||
    componentsQuery.error ||
    equipmentsQuery.error;

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F4F5F7] px-6 py-6 font-sans">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-5">
          <div className="h-[84px] animate-pulse rounded-lg border border-[#DFE1E6] bg-white" />

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[72px] animate-pulse rounded-lg border border-[#DFE1E6] bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (hasError) {
    console.error(
      materialsQuery.error,
      accessoriesQuery.error,
      componentsQuery.error,
      equipmentsQuery.error
    );

    return (
      <div className="min-h-screen w-full bg-[#F4F5F7] px-6 py-6 font-sans">
        <div className="mx-auto flex min-h-[300px] w-full max-w-[1800px] items-center justify-center">
          <div className="rounded-lg border border-[#DFE1E6] bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEBE6] text-[#DE350B]">
              !
            </div>

            <h2 className="text-sm font-semibold text-[#172B4D]">
              Não foi possível carregar as receitas
            </h2>

            <p className="mt-1 text-xs text-[#5E6C84]">
              Verifique a conexão e tente novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DADOS
  // =========================================================

  const materialsList = materialsQuery.data || [];
  const accessoriesList = accessoriesQuery.data || [];
  const componentsList = componentsQuery.data || [];
  const equipmentsList = equipmentsQuery.data || [];

  // =========================================================
  // FILTROS
  // =========================================================

  const normalizedMaterialSearch = searchMaterial.trim().toLowerCase();
  const normalizedAccessorySearch = searchAccessory.trim().toLowerCase();
  const normalizedComponentSearch = searchComponent.trim().toLowerCase();
  const normalizedEquipmentSearch = searchEquipment.trim().toLowerCase();

  const filterMaterials = materialsList.filter((item) =>
    item.Material.toLowerCase().includes(normalizedMaterialSearch)
  );

  const filterAccessories = accessoriesList.filter((item) =>
    item.Acessório.toLowerCase().includes(normalizedAccessorySearch)
  );

  const filterComponents = componentsList.filter((item) =>
    item.Componente.toLowerCase().includes(normalizedComponentSearch)
  );

  const filterEquipments = equipmentsList.filter((item) =>
    item.Equipamento.toLowerCase().includes(normalizedEquipmentSearch)
  );

  // =========================================================
  // SEÇÕES
  // =========================================================

  const sections = [
    {
      label: "Material",
      description: "Materiais disponíveis e seus valores unitários.",
      list: filterMaterials,
      total: materialsList.length,
      isExpand: materialsExpanded,
      setExpand: setMaterialsExpanded,
      setSearch: setSearchMaterial,
    },
    {
      label: "Acessório",
      description: "Acessórios cadastrados no sistema.",
      list: filterAccessories,
      total: accessoriesList.length,
      isExpand: accessoriesExpanded,
      setExpand: setAccessoriesExpanded,
      setSearch: setSearchAccessory,
    },
    {
      label: "Componente",
      description: "Receitas e composição dos componentes.",
      list: filterComponents,
      total: componentsList.length,
      isExpand: componentsExpanded,
      setExpand: setComponentsExpanded,
      setSearch: setSearchComponent,
    },
    {
      label: "Equipamento",
      description: "Receitas e composição dos equipamentos.",
      list: filterEquipments,
      total: equipmentsList.length,
      isExpand: equipmentsExpanded,
      setExpand: setEquipmentsExpanded,
      setSearch: setSearchEquipment,
    },
  ];

    return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-[#F4F5F7] font-sans">
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 pb-5">

          {/* =================================================
              CABEÇALHO DA PÁGINA
          ================================================= */}

          <div className="flex min-h-[72px] flex-col justify-between gap-4 rounded-lg border border-[#DFE1E6] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)] sm:flex-row sm:items-center">

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#DEEBFF] text-[#0052CC]">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[17px] font-semibold leading-5 text-[#172B4D]">
                  Receitas
                </h1>

                <p className="mt-0.5 truncate text-xs text-[#5E6C84]">
                  Gerencie materiais, acessórios, componentes e equipamentos.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-md bg-[#F4F5F7] px-3 py-1.5 text-xs font-medium text-[#5E6C84]">
                {materialsList.length +
                  accessoriesList.length +
                  componentsList.length +
                  equipmentsList.length}{" "}
                registros
              </div>
            </div>
          </div>

          {/* =================================================
              SEÇÕES DE RECEITAS
          ================================================= */}

          {sections.map((section) => (
            <div
              key={section.label}
              className="w-full"
            >
              <RecipeHeader i={section} />
              <RecipeTable i={section} />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Recipes;