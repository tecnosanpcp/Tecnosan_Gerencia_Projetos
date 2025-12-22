// Bibliotecas
import { useEffect, useState } from "react";
import { parseBRL } from "../../../utils/IntUtils";

// Componentes
import NavBar from "../../Ui/NavBar";
import RecipeTable from "./RecipeTable";
import RecipeHeader from "./RecipeHeader";

// Serviços
import { listMaterials } from "@services/MaterialService.js";

import { VerifyAuth } from "@services/AuthService.js";
import {
  vwComponentRecipeMaterials,
  vwEquipmentMaterialsSummary,
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

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await listMaterials();
        const formatted_data = data.map((i) => ({
          ID: i.material_id,
          Material: i.material_name,
          Descrição: i.material_desc,
          "Valor Unitário": `R$ ${i.value} / ${i.uni}`,
        }));
        setMaterialsList(formatted_data);
      } catch (error) {
        console.error("Erro ao buscar materiais", error);
      }
    };

    const loadData = async () => {
      await VerifyAuth();

      const data_comp = await vwComponentRecipeMaterials();
      const formatted_data_comp = data_comp.map((dc) => ({
        ID: dc.component_recipe_id,
        Componente: dc.recipe_name,
        Resina: dc.resina,
        "Resina ISO": dc.resina_iso,
        Manta: dc.manta,
        Roving: dc.roving,
        Catalizador: dc.catalizador,
        "Tecido (KG)": dc.tecido_kg,
        "Tecido (CMD)": dc.tecido_cmd,
        "Horas-Homens": dc.horas_homem,
        "Valor Total": parseBRL(dc.total_value),
      }));
      setComponentsList(formatted_data_comp);

      const data_equip = await vwEquipmentMaterialsSummary();
      const formatted_data_equip = data_equip.map((de) => ({
        ID: de.equipment_recipe_id,
        Equipamento: de.recipe_name,
        Resina: de.resina,
        "Resina ISO": de.resina_iso,
        Manta: de.manta,
        Roving: de.roving,
        Catalizador: de.catalizador,
        "Tecido (KG)": de.tecido_kg,
        "Tecido (CMD)": de.tecido_cmd,
        "Horas-Homens": de.horas_homem,
        "Valor Total": parseBRL(de.total_value),
      }));
      setEquipmentsList(formatted_data_equip);
    };

    fetchMaterials();
    loadData();
  }, []);

  const filterMaterials = materialsList.filter((m) =>
    m.Material.includes(searchMaterial)
  );

  const filterComponents = componentsList.filter((c) =>
    c.Componente.includes(searchComponent)
  );

  const filterEquipments = equipmentsList.filter((e) =>
    e.Equipamento.includes(searchEquipment)
  );

  return (
    <div className="w-full flex flex-col gap-4 text-xs mb-16 overflow-x-hidden overflow-y-auto">
      <NavBar select_index={5} />

      {[
        {
          label: "Material",
          list: filterMaterials,
          isExpand: materialsExpanded,
          setExpand: setMaterialsExpanded,
          setSearch: setSearchMaterial,
        },
        {
          label: "Componente",
          list: filterComponents,
          isExpand: componentsExpanded,
          setExpand: setcomponetsExpanded,
          setSearch: setSearchComponent,
        },
        {
          label: "Equipamento",
          list: filterEquipments,
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
