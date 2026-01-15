import React, { useEffect, useState } from "react";

import {
  vwEquipmentRecipesMaterialSummary,
  vwComponentRecipeMaterialsSummary,
} from "@services/ViewsService.js";

// Importação do serviço
import { updateDates } from "@services/EquipRecipeCompRecipe";
import { formatDate, formatForInput } from "@utils/dateUtils.js";

function BudgetEquipmentTable({
  currentBudget,
  searchTerm = "",
  timelineTasks,
  timelineEquipments,
}) {
  const [equipmentsRecipesSummary, setEquipmentsRecipesSummary] = useState([]);
  const [componentsRecipesSummary, setComponentsRecipesSummary] = useState([]);
  const [rowsExpands, setRowsExpand] = useState([]);

  const [modifiedData, setModifiedData] = useState({});
  const [inputDisable, setInputDisable] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [equipmentsSummaryData, componentsSummaryData] = await Promise.all([
        vwEquipmentRecipesMaterialSummary(currentBudget.id),
        vwComponentRecipeMaterialsSummary(currentBudget.id),
      ]);

      setEquipmentsRecipesSummary(equipmentsSummaryData);
      setComponentsRecipesSummary(componentsSummaryData);
    };
    loadData();
    if (currentBudget.status != "Em Planejamento") {
      setInputDisable(true);
    } else {
      setInputDisable(false);
    }
  }, [currentBudget]);

  // Atualiza o estado visual enquanto o usuário digita
  const handleInputChange = (componentId, field, value) => {
    setModifiedData((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [field]: value,
      },
    }));
  };

  // --- FUNÇÃO DE SALVAMENTO (ATUALIZAÇÃO PARCIAL) ---
  const handleDateSave = async (
    equipment_recipe_id,
    component_recipe_id,
    type
  ) => {
    const newValue = modifiedData[component_recipe_id]?.[type];
    if (!newValue) return;

    try {
      const startToSend = type === "start" ? newValue : null;
      const endToSend = type === "end" ? newValue : null;

      await updateDates(
        equipment_recipe_id,
        component_recipe_id,
        startToSend,
        endToSend
      );
    } catch (error) {
      console.error("Erro ao salvar data:", error);
      alert("Erro ao salvar a data no cronograma.");
    }
  };

  const getInputValue = (componentId, field, originalDate) => {
    if (
      modifiedData[componentId] &&
      modifiedData[componentId][field] !== undefined
    ) {
      return modifiedData[componentId][field];
    }
    return formatForInput(originalDate);
  };

  useEffect(() => console.log(currentBudget), [currentBudget]);

  return (
    <table className="w-full project-equipments text-center">
      <thead>
        <tr className="text-left bg-[#DBEBFF]">
          <th className="first:rounded-tl-lg" colSpan={2}>
            Equipamentos
          </th>
          <th>Início</th>
          <th>Fim</th>
          <th>Resina</th>
          <th>Roving</th>
          <th>Tecido KG</th>
          <th>Tec. CMD</th>
          <th>Catalizador</th>
          <th>Manta</th>
          <th>Reina ISO</th>
          <th>Valor</th>
          <th className="last:rounded-tr-lg">Horas</th>
        </tr>
      </thead>
      <tbody>
        {equipmentsRecipesSummary
          ?.filter((equip) =>
            equip?.recipe_name
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase())
          )
          .map((equip) => {
            const timeline_proj = timelineEquipments.find(
              (time_equip) =>
                time_equip.equipment_recipe_id == equip.equipment_recipe_id
            );
            return (
              <React.Fragment key={equip?.equipment_recipe_id}>
                <tr className="bg-gray-200">
                  <td>
                    <button
                      onClick={() => {
                        if (
                          !rowsExpands?.includes(equip?.equipment_recipe_id)
                        ) {
                          setRowsExpand((prev) => [
                            ...prev,
                            equip?.equipment_recipe_id,
                          ]);
                        } else {
                          setRowsExpand((prev) =>
                            prev.filter(
                              (row) => row != equip?.equipment_recipe_id
                            )
                          );
                        }
                      }}
                    >
                      <img
                        src={
                          rowsExpands?.includes(equip?.equipment_recipe_id)
                            ? "src/imgs/remove-square.png"
                            : "src/imgs/add-square.png"
                        }
                        className="w-5 h-5"
                        alt="Toggle"
                      />
                    </button>
                  </td>
                  <td>{equip.recipe_name}</td>
                  <td>{formatDate(timeline_proj?.equipment_start_at)}</td>
                  <td>{formatDate(timeline_proj?.equipment_end_at)}</td>
                  <td>{equip.resina}</td>
                  <td>{equip.roving}</td>
                  <td>{equip.tecido_kg}</td>
                  <td>{equip.tecido_cmd}</td>
                  <td>{equip.catalizador}</td>
                  <td>{equip.manta}</td>
                  <td>{equip.resina_iso}</td>
                  <td>{equip.total_value}</td>
                  <td>{equip.horas_homem}</td>
                </tr>
                {rowsExpands?.includes(equip?.equipment_recipe_id) &&
                  componentsRecipesSummary
                    .filter(
                      (c) => c.equipment_recipe_id == equip.equipment_recipe_id
                    )
                    .map((comp, index) => {
                      const comp_tasks = timelineTasks.find(
                        (taks) =>
                          taks.component_recipe_id == comp.component_recipe_id
                      );

                      const bg_color =
                        index % 2 == 0 ? "bg-gray-50" : "bg-gray-100";

                      return (
                        <tr key={comp.component_recipe_id} className={bg_color}>
                          <td colSpan={2}>{comp.recipe_name}</td>

                          {/* INPUT DE INÍCIO */}
                          <td>
                            <input
                              type="date"
                              className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full cursor-pointer hover:bg-white text-center"
                              value={getInputValue(
                                comp.component_recipe_id,
                                "start",
                                comp_tasks?.planned_start_at
                              )}
                              onChange={(e) =>
                                handleInputChange(
                                  comp.component_recipe_id,
                                  "start",
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                handleDateSave(
                                  equip.equipment_recipe_id,
                                  comp.component_recipe_id,
                                  "start"
                                )
                              }
                              disabled={inputDisable}
                            />
                          </td>

                          {/* INPUT DE FIM */}
                          <td>
                            <input
                              type="date"
                              className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full cursor-pointer hover:bg-white text-center"
                              value={getInputValue(
                                comp.component_recipe_id,
                                "end",
                                comp_tasks?.planned_end_at
                              )}
                              onChange={(e) =>
                                handleInputChange(
                                  comp.component_recipe_id,
                                  "end",
                                  e.target.value
                                )
                              }
                              onBlur={() =>
                                handleDateSave(
                                  equip.equipment_recipe_id,
                                  comp.component_recipe_id,
                                  "end"
                                )
                              }
                              disabled={inputDisable}
                            />
                          </td>

                          <td>{comp.resina}</td>
                          <td>{comp.roving}</td>
                          <td>{comp.tecido_kg}</td>
                          <td>{comp.tecido_cmd}</td>
                          <td>{comp.catalizador}</td>
                          <td>{comp.manta}</td>
                          <td>{comp.resina_iso}</td>
                          <td>{comp.total_value}</td>
                          <td>{comp.horas_homem}</td>
                        </tr>
                      );
                    })}
              </React.Fragment>
            );
          })}
      </tbody>
    </table>
  );
}

export default BudgetEquipmentTable;
