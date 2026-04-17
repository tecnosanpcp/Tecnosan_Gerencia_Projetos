import { useState, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";

// Serviços
import { updateDates } from "@services/EquipRecipeCompRecipe";
import { deleteRelation } from "@services/BudgetsEquipRecipesServices.js";

// Utilitários
import { formatDate, formatForInput } from "@utils/dateUtils.js";

function BudgetEquipmentTable({
  currentBudget,
  groupedData,
  searchTerm = "",
  timelineTasks,
  timelineEquipments,
}) {
  const queryClient = useQueryClient();
  const [rowsExpands, setRowsExpand] = useState([]);
  const [modifiedData, setModifiedData] = useState({});

  // --- MUTAÇÕES ---
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["budgetDetails"] });
    queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
    queryClient.invalidateQueries({ queryKey: ["timelineEquipments"] });
  };

  const deleteMutation = useMutation({
    mutationFn: ({ budgetId, equipId }) => deleteRelation(budgetId, equipId),
    onSuccess: invalidateAll,
  });

  const dateMutation = useMutation({
    mutationFn: ({ equipId, compId, start, end }) =>
      updateDates(equipId, compId, start, end),
    onSuccess: invalidateAll,
  });

  // --- LÓGICA ---
  const handleInputChange = (componentId, field, value) => {
    setModifiedData((prev) => ({
      ...prev,
      [componentId]: { ...prev[componentId], [field]: value },
    }));
  };

  const handleDateSave = (equipId, compId, type) => {
    const newValue = modifiedData[compId]?.[type];
    if (!newValue) return;
    dateMutation.mutate({
      equipId,
      compId,
      start: type === "start" ? newValue : null,
      end: type === "end" ? newValue : null,
    });
  };

  const getInputValue = (componentId, field, originalDate) => {
    if (modifiedData[componentId]?.[field] !== undefined) {
      return modifiedData[componentId][field];
    }
    return formatForInput(originalDate);
  };

  if (!groupedData || groupedData.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        Nenhum dado encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-4">
      {groupedData.map((group) => (
        <div key={group.budget_id} className="flex flex-col gap-2">
          {!currentBudget && (
            <h2 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-2">
              {group.budget_name}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({group.status})
              </span>
            </h2>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full project-equipments text-center">
              <thead>
                <tr className="text-left bg-[#DBEBFF]">
                  <th className="first:rounded-tl-lg px-4 py-2">
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
                  <th>Horas</th>
                  <th className="last:rounded-tr-lg px-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {group.equipments
                  ?.filter((equip) =>
                    equip?.recipe_name
                      ?.toLowerCase()
                      ?.includes(searchTerm?.toLowerCase()),
                  )
                  .map((equip) => {
                    const timeline_proj = timelineEquipments.find(
                      (te) =>
                        te.equipment_recipe_id == equip.equipment_recipe_id,
                    );
                    const isLocked = group.status !== "Em Planejamento";

                    return (
                      <Fragment key={equip.equipment_recipe_id}>
                        <tr
                          className="bg-gray-200 hover:cursor-pointer"
                          onClick={() => {
                            setRowsExpand((prev) =>
                              prev.includes(equip.equipment_recipe_id)
                                ? prev.filter(
                                    (id) => id !== equip.equipment_recipe_id,
                                  )
                                : [...prev, equip.equipment_recipe_id],
                            );
                          }}
                        >
                          <td>{equip.recipe_name}</td>
                          <td>
                            {formatDate(timeline_proj?.equipment_start_at)}
                          </td>
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
                          {/* LIXEIRA */}
                          <td>
                            {!isLocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Evita expandir a linha ao clicar na lixeira
                                  if (confirm(`Remover ${equip.recipe_name}?`))
                                    deleteMutation.mutate({
                                      budgetId: group.budget_id,
                                      equipId: equip.equipment_recipe_id,
                                    });
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <FaTrash size={13} />
                              </button>
                            )}
                          </td>
                        </tr>

                        {rowsExpands.includes(equip.equipment_recipe_id) &&
                          group.components
                            .filter(
                              (c) =>
                                c.equipment_recipe_id ==
                                equip.equipment_recipe_id,
                            )
                            .map((comp, index) => {
                              const comp_tasks = timelineTasks.find(
                                (t) =>
                                  t.component_recipe_id ==
                                  comp.component_recipe_id,
                              );
                              return (
                                <tr
                                  key={comp.component_recipe_id}
                                  className={
                                    index % 2 === 0
                                      ? "bg-gray-50"
                                      : "bg-gray-100"
                                  }
                                >
                                  <td>{comp.recipe_name}</td>
                                  <td>
                                    <input
                                      type="date"
                                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full text-center"
                                      value={getInputValue(
                                        comp.component_recipe_id,
                                        "start",
                                        comp_tasks?.planned_start_at,
                                      )}
                                      onChange={(e) =>
                                        handleInputChange(
                                          comp.component_recipe_id,
                                          "start",
                                          e.target.value,
                                        )
                                      }
                                      onBlur={() =>
                                        handleDateSave(
                                          equip.equipment_recipe_id,
                                          comp.component_recipe_id,
                                          "start",
                                        )
                                      }
                                      disabled={isLocked}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="date"
                                      className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full text-center"
                                      value={getInputValue(
                                        comp.component_recipe_id,
                                        "end",
                                        comp_tasks?.planned_end_at,
                                      )}
                                      onChange={(e) =>
                                        handleInputChange(
                                          comp.component_recipe_id,
                                          "end",
                                          e.target.value,
                                        )
                                      }
                                      onBlur={() =>
                                        handleDateSave(
                                          equip.equipment_recipe_id,
                                          comp.component_recipe_id,
                                          "end",
                                        )
                                      }
                                      disabled={isLocked}
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
                                  <td></td>{" "}
                                  {/* Coluna da lixeira vazia para manter alinhamento */}
                                </tr>
                              );
                            })}
                      </Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BudgetEquipmentTable;
