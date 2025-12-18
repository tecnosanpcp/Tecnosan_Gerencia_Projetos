// Bibliotecas
import { useEffect, useState } from "react";

// Componentes
import NavBar from "../../Ui/NavBar";
import RecipeTable from "./RecipeTable";
import RecipeHeader from "./RecipeHeader";

// Serviços
import { listMaterials } from "@services/MaterialService.js";
import {
  vwEquipmentRecipesMaterialSummary,
  vwComponentRecipeMaterialsSummary,
} from "@services/ViewsService.js";

function Recipes() {
  const [materialsExpanded, setMaterialsExpanded] = useState(false);
  const [componentsExpanded, setcomponetsExpanded] = useState(false);
  const [equipmentsExpanded, setEquipmentsExpanded] = useState(false);

  const [materialsList, setMaterialsList] = useState([]);
  const [componentsList, setComponentsList] = useState([]);
  const [equipmentsList, setEquipmentsList] = useState([]);

  // Novos estados de busca
  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchComponent, setSearchComponent] = useState("");
  const [searchEquipment, setSearchEquipment] = useState("");

  // Listas filtradas
  const filteredMaterials = materialsList.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(searchMaterial.toLowerCase())
    )
  );

  const filteredComponents = componentsList.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(searchComponent.toLowerCase())
    )
  );

  const filteredEquipments = equipmentsList.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(searchEquipment.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await listMaterials();
        const formatted_data = data.map((i) => ({
          ID: i.material_id,
          Nome: i.material_name,
          Descrição: i.material_desc,
          "Valor Unitário": `R$ ${i.value} / ${i.uni}`,
        }));
        setMaterialsList(formatted_data);
      } catch (error) {
        console.error("Erro ao buscar materiais", error);
      }
    };

    const fetchComponentRecipeMaterial = async () => {
      try {
        const data = await vwComponentRecipeMaterialsSummary();

        const formatted_data = data.map((i) => ({
          ID: i.component_recipe_id,
          Componente: i.recipe_name,
          Resina: i.resina,
          "Resina ISO": i.resina_iso,
          Manta: i.manta,
          Roving: i.roving,
          Catalizador: i.catalizador,
          "Tecido KG": i.tecido_kg,
          "Tecido CMD": i.tecido_cmd,
          "Horas Homem": i.horas_homem,
          "Valor Total": i.total_value,
        }));
        setComponentsList(formatted_data);
      } catch (error) {
        console.error("Erro ao buscar componentes", error);
      }
    };

    const fetchProjectMaterials = async () => {
      try {
        const data = await vwEquipmentRecipesMaterialSummary();

        const formatted_data = data.map((i) => ({
          ID: i.equipment_recipe_id,
          "Nome do Equipamento": i.recipe_name,
          Resina: i.resina,
          "Resina ISO": i.resina_iso,
          Manta: i.manta,
          Roving: i.roving,
          Catalizador: i.catalizador,
          "Tecido KG": i.tecido_kg,
          "Tecido CMD": i.tecido_cmd,
          "Horas Homem": i.horas_homem,
          "Valor Total": i.total_value,
        }));

        setEquipmentsList(formatted_data);
      } catch (error) {
        console.error("Erro ao buscar equipamentos", error);
      }
    };

    fetchMaterials();
    fetchComponentRecipeMaterial();
    fetchProjectMaterials();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 text-xs mb-16 overflow-x-hidden overflow-y-auto">
      <NavBar select_index={5} />

      {[
        {
          label: "Material",
          list: filteredMaterials,
          isExpand: materialsExpanded,
          setExpand: setMaterialsExpanded,
          setSearch: setSearchMaterial,
        },
        {
          label: "Componente",
          list: filteredComponents,
          isExpand: componentsExpanded,
          setExpand: setcomponetsExpanded,
          setSearch: setSearchComponent,
        },
        {
          label: "Equipamento",
          list: filteredEquipments,
          isExpand: equipmentsExpanded,
          setExpand: setEquipmentsExpanded,
          setSearch: setSearchEquipment,
        },
      ].map((i, key) => (
        <div className="justify-between self-center w-4/5 " key={key}>
          <RecipeHeader i={i} />
          <RecipeTable i={i} />
        </div>
      ))}
    </div>
  );
}

export default Recipes;
