import { useState, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";

import { updateDates } from "@services/EquipRecipeCompRecipe";
import { deleteRelation } from "@services/BudgetsEquipRecipesServices.js";

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

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["budgetDetails"] });
    queryClient.invalidateQueries({ queryKey: ["timelineTasks"] });
    queryClient.invalidateQueries({ queryKey: ["timelineEquipments"] });
  };

  const deleteMutation = useMutation({
    mutationFn: ({ budgetId, equipId }) =>
      deleteRelation(budgetId, equipId),
    onSuccess: invalidateAll,
  });

  const dateMutation = useMutation({
    mutationFn: ({ equipId, compId, start, end }) =>
      updateDates(equipId, compId, start, end),
    onSuccess: invalidateAll,
  });

  const handleInputChange = (componentId, field, value) => {
    setModifiedData((prev) => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [field]: value,
      },
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

  const toggleRow = (equipmentId) => {
    setRowsExpand((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((id) => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  if (!groupedData || groupedData.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-white">
        <div className="text-center">
          <p className="text-sm font-medium text-[#172B4D]">
            Nenhum equipamento encontrado
          </p>
          <p className="mt-1 text-xs text-[#5E6C84]">
            Não existem dados para exibir neste orçamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-2">
      {groupedData.map((group) => {
        const filteredEquipments =
          group.equipments?.filter((equip) =>
            equip?.recipe_name
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase())
          ) || [];

        return (
          <div
            key={group.budget_id}
            className="flex w-full flex-col border-b border-[#DFE1E6]"
          >
            {!currentBudget && (
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-[#172B4D]">
                    {group.budget_name}
                  </h2>
                </div>

                <span className="ml-3 shrink-0 rounded-full bg-[#F4F5F7] px-2 py-1 text-[10px] font-semibold text-[#5E6C84]">
                  {group.status}
                </span>
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed ">
                <colgroup>
                  <col className="w-[17%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Equipamento
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Início
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Fim
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Resina
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Roving
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Tecido KG
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Tec. CMD
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Catalizador
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Manta
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Resina ISO
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Valor
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Horas
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEquipments.map((equip) => {
                    const timelineProj = timelineEquipments.find(
                      (te) =>
                        te.equipment_recipe_id ==
                        equip.equipment_recipe_id
                    );

                    const isLocked =
                      group.status !== "Em Planejamento";

                    const isExpanded = rowsExpands.includes(
                      equip.equipment_recipe_id
                    );

                    const components =
                      group.components?.filter(
                        (c) =>
                          c.equipment_recipe_id ==
                          equip.equipment_recipe_id
                      ) || [];

                    return (
                      <Fragment key={equip.equipment_recipe_id}>
                        <tr
                          onClick={() =>
                            toggleRow(equip.equipment_recipe_id)
                          }
                          className={`group cursor-pointer border-b border-[#EBECF0] transition-colors ${
                            isExpanded
                              ? "bg-[#DEEBFF]/40"
                              : "bg-white hover:bg-[#F4F5F7]"
                          }`}
                        >
                          <td className="px-3 py-2 text-left">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold transition-colors ${
                                  isExpanded
                                    ? "bg-[#0052CC] text-white"
                                    : "bg-[#F4F5F7] text-[#5E6C84]"
                                }`}
                              >
                                {isExpanded ? "−" : "+"}
                              </span>

                              <span
                                className="truncate text-xs font-semibold text-[#172B4D]"
                                title={equip.recipe_name}
                              >
                                {equip.recipe_name}
                              </span>
                            </div>
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#5E6C84]">
                            {formatDate(
                              timelineProj?.equipment_start_at
                            )}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#5E6C84]">
                            {formatDate(
                              timelineProj?.equipment_end_at
                            )}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.resina ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.roving ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.tecido_kg ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.tecido_cmd ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.catalizador ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.manta ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.resina_iso ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] font-medium text-[#172B4D]">
                            {equip.total_value ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#172B4D]">
                            {equip.horas_homem ?? "-"}
                          </td>

                          <td className="px-2 py-2 text-center">
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  if (
                                    confirm(
                                      `Remover ${equip.recipe_name}?`
                                    )
                                  ) {
                                    deleteMutation.mutate({
                                      budgetId: group.budget_id,
                                      equipId:
                                        equip.equipment_recipe_id,
                                    });
                                  }
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#5E6C84] transition-colors hover:bg-[#FFEBE6] hover:text-[#DE350B]"
                                title="Remover equipamento"
                              >
                                <FaTrash size={11} />
                              </button>
                            )}
                          </td>
                        </tr>

                        {isExpanded &&
                          components.map((comp, index) => {
                            const compTasks =
                              timelineTasks.find(
                                (t) =>
                                  t.component_recipe_id ==
                                  comp.component_recipe_id
                              );

                            return (
                              <tr
                                key={comp.component_recipe_id}
                                className={`border-b border-[#EBECF0] ${
                                  index % 2 === 0
                                    ? "bg-[#FAFBFC]"
                                    : "bg-white"
                                }`}
                              >
                                <td className="px-3 py-2 pl-10 text-left">
                                  <div className="truncate text-[11px] font-medium text-[#5E6C84]">
                                    {comp.recipe_name}
                                  </div>
                                </td>

                                <td className="px-2 py-1.5">
                                  <input
                                    type="date"
                                    className="h-7 w-full rounded border border-[#DFE1E6] bg-white px-1 text-[10px] text-[#172B4D] outline-none transition focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF]/30 disabled:bg-[#F4F5F7] disabled:text-[#8993A4]"
                                    value={getInputValue(
                                      comp.component_recipe_id,
                                      "start",
                                      compTasks?.planned_start_at
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
                                    disabled={isLocked}
                                  />
                                </td>

                                <td className="px-2 py-1.5">
                                  <input
                                    type="date"
                                    className="h-7 w-full rounded border border-[#DFE1E6] bg-white px-1 text-[10px] text-[#172B4D] outline-none transition focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF]/30 disabled:bg-[#F4F5F7] disabled:text-[#8993A4]"
                                    value={getInputValue(
                                      comp.component_recipe_id,
                                      "end",
                                      compTasks?.planned_end_at
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
                                    disabled={isLocked}
                                  />
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.resina ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.roving ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.tecido_kg ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.tecido_cmd ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.catalizador ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.manta ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.resina_iso ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.total_value ?? "-"}
                                </td>

                                <td className="px-2 py-2 text-center text-[10px] text-[#5E6C84]">
                                  {comp.horas_homem ?? "-"}
                                </td>

                                <td />
                              </tr>
                            );
                          })}
                      </Fragment>
                    );
                  })}

                  {filteredEquipments.length === 0 && (
                    <tr>
                      <td
                        colSpan={13}
                        className="px-4 py-10 text-center"
                      >
                        <p className="text-sm font-medium text-[#172B4D]">
                          Nenhum equipamento encontrado
                        </p>
                        <p className="mt-1 text-xs text-[#5E6C84]">
                          Tente alterar o termo de pesquisa.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BudgetEquipmentTable;