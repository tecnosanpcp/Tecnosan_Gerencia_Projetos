import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseBRL } from "../../../utils/IntUtils";

import NavBar from "../../Ui/NavBar";
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

  // =========================
  // SAFE HELPERS
  // =========================

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const safeBRL = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "R$ 0,00";
    return parseBRL(num);
  };

  const safeString = (v) => (v ? String(v) : "-");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  // =========================
  // QUERIES
  // =========================

  const materialsQuery = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const data = await listMaterials();

      return safeArray(data).map((i) => ({
        ID: i?.material_id ?? "-",
        Material: safeString(i?.material_name),
        Descrição: safeString(i?.material_desc),
        "Valor Unitário": `R$ ${safeString(i?.value)} / ${safeString(i?.uni)}`,
      }));
    },
  });

  const accessoriesQuery = useQuery({
    queryKey: ["accessories"],
    queryFn: async () => {
      const data = await listAccessories();

      return safeArray(data).map((i) => ({
        ID: i?.accessory_id ?? "-",
        Acessório: safeString(i?.name),
        "Nº de Série": safeString(i?.serial_number),
        "Data da Compra": formatDate(i?.purchase_date),
        Status: safeString(i?.status),
        Valor: safeBRL(i?.value),
      }));
    },
  });

  const componentsQuery = useQuery({
    queryKey: ["components"],
    queryFn: async () => {
      const data = await vwComponentRecipeMaterials();

      return safeArray(data).map((dc) => ({
        ID: dc?.component_recipe_id ?? "-",
        Componente: safeString(dc?.recipe_name),
        "Total Funcionários": dc?.qtd_employees ?? 0,
        "Total Horas": dc?.qtd_hours ?? 0,
        "Horas-Homens": dc?.horas_homem ?? 0,
        "Valor Total": safeBRL(dc?.total_value),
      }));
    },
  });

  const equipmentsQuery = useQuery({
    queryKey: ["equipments"],
    queryFn: async () => {
      const data = await vwEquipmentMaterialsSummary();

      return safeArray(data).map((de) => ({
        ID: de?.equipment_recipe_id ?? "-",
        Equipamento: safeString(de?.recipe_name),
        "Horas-Homens": de?.horas_homem ?? 0,
        "Valor Total": safeBRL(de?.total_value),
      }));
    },
  });

  // =========================
  // LOADING / ERROR GLOBAL
  // =========================

  if (
    materialsQuery.isLoading ||
    accessoriesQuery.isLoading ||
    componentsQuery.isLoading ||
    equipmentsQuery.isLoading
  ) {
    return <div>Carregando...</div>;
  }

  if (
    materialsQuery.error ||
    accessoriesQuery.error ||
    componentsQuery.error ||
    equipmentsQuery.error
  ) {
    console.error(
      materialsQuery.error,
      accessoriesQuery.error,
      componentsQuery.error,
      equipmentsQuery.error
    );

    return <div>Erro ao carregar dados</div>;
  }

  // =========================
  // DADOS
  // =========================

  const materialsList = materialsQuery.data || [];
  const accessoriesList = accessoriesQuery.data || [];
  const componentsList = componentsQuery.data || [];
  const equipmentsList = equipmentsQuery.data || [];

  // =========================
  // FILTROS
  // =========================

  const filterMaterials = materialsList.filter((m) =>
    m.Material.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  const filterAccessories = accessoriesList.filter((a) =>
    a.Acessório.toLowerCase().includes(searchAccessory.toLowerCase())
  );

  const filterComponents = componentsList.filter((c) =>
    c.Componente.toLowerCase().includes(searchComponent.toLowerCase())
  );

  const filterEquipments = equipmentsList.filter((e) =>
    e.Equipamento.toLowerCase().includes(searchEquipment.toLowerCase())
  );

  const sections = [
    {
      label: "Material",
      list: filterMaterials,
      isExpand: materialsExpanded,
      setExpand: setMaterialsExpanded,
      setSearch: setSearchMaterial,
    },
    {
      label: "Acessório",
      list: filterAccessories,
      isExpand: accessoriesExpanded,
      setExpand: setAccessoriesExpanded,
      setSearch: setSearchAccessory,
    },
    {
      label: "Componente",
      list: filterComponents,
      isExpand: componentsExpanded,
      setExpand: setComponentsExpanded,
      setSearch: setSearchComponent,
    },
    {
      label: "Equipamento",
      list: filterEquipments,
      isExpand: equipmentsExpanded,
      setExpand: setEquipmentsExpanded,
      setSearch: setSearchEquipment,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 text-xs pb-16 overflow-auto">
      <NavBar select_index={5} />

      {sections.map((i, key) => (
        <div key={key} className="w-4/5 self-center">
          <RecipeHeader i={i} />
          <RecipeTable i={i} />
        </div>
      ))}
    </div>
  );
}

export default Recipes;