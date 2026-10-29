import { useState, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";

import { upsertBudgetComponentSchedule } from "@services/BudgetsComponentsScheduleService.js";
// TODO: descomente quando o service existir e confirme o caminho do import
import { deleteBudgetEquipment } from "@services/BudgetsEquipmentsService.js";

import { formatDate, formatForInput } from "@utils/dateUtils.js";

// Stub temporário: remova quando importar o deleteRelation real.

function BudgetEquipmentTable({
  currentBudget,
  groupedData,
  searchTerm = "",
  timelineEquipments = [],
  timelineTasks = [],
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
    mutationFn: (budgetEquipmentId) => deleteBudgetEquipment(budgetEquipmentId),

    onSuccess: () => {
      invalidateAll();
    },

    onError: (error) => {
      console.error("Erro ao excluir equipamento:", error);
      alert("Não foi possível excluir o equipamento.");
    },
  });

  const dateMutation = useMutation({
    mutationFn: ({ budgetEquipmentId, compId, start, end }) =>
      upsertBudgetComponentSchedule(
        currentBudget?.id || currentBudget?.budget_id,
        budgetEquipmentId, 
        compId, 
        start, 
        end),
    onSuccess: invalidateAll,
  });

  // A chave é composta (linha + componente) porque o mesmo equipamento
  // pode aparecer mais de uma vez no orçamento.
  const handleInputChange = (key, field, value) => {
    setModifiedData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleDateSave = (budgetEquipmentId, compId, key, type) => {
    const dates = modifiedData[key];

    if (!dates) return;

    let start = dates.start;
    let end = dates.end;

    if (!start || !end) return;

    if (end < start) {
      alert("A data de término não pode ser anterior à data de início.");
      end = start
      return;
    }

    dateMutation.mutate({
      budgetEquipmentId,
      compId,
      start,
      end,
    });
  };

  const getInputValue = (key, field, originalDate) => {
    if (modifiedData[key]?.[field] !== undefined) {
      return modifiedData[key][field];
    }

    return formatForInput(originalDate);
  };

  const toggleRow = (rowKey) => {
    setRowsExpand((prev) =>
      prev.includes(rowKey)
        ? prev.filter((id) => id !== rowKey)
        : [...prev, rowKey],
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

  const thBase =
    "px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]";
  const dateInputClass =
    "h-7 w-full rounded border border-[#DFE1E6] bg-white px-1 text-[10px] text-[#172B4D] outline-none transition focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF]/30 disabled:bg-[#F4F5F7] disabled:text-[#8993A4]";

  return (
    <div className="flex min-w-0 w-full flex-col">
      {groupedData.map((group) => {
        const term = (searchTerm || "").toLowerCase();

        const filteredEquipments =
          group.equipments?.filter((equip) =>
            (equip?.equipment_name || "").toLowerCase().includes(term),
          ) || [];

        return (
          <div
            key={group.budget_id}
            className="flex min-w-0 w-full flex-col border-b border-[#DFE1E6]"
          >
            {!currentBudget && (
              <div className="flex items-center justify-between border-y border-[#B3D4FF] bg-[#E9F2FF] px-3 py-2">
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

            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
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
                    <th className={thBase}>Início</th>
                    <th className={thBase}>Fim</th>
                    <th className={thBase}>Resina</th>
                    <th className={thBase}>Roving</th>
                    <th className={thBase}>Tecido KG</th>
                    <th className={thBase}>Tec. CMD</th>
                    <th className={thBase}>Catalizador</th>
                    <th className={thBase}>Manta</th>
                    <th className={thBase}>Resina ISO</th>
                    <th className={thBase}>Valor</th>
                    <th className={thBase}>Horas</th>
                    <th className={thBase}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEquipments.map((equip, idx) => {
                    // Chave única por linha (o mesmo equipamento pode se repetir)
                    const rowKey =
                      equip.budget_equipment_id ??
                      `${equip.budget_id}-${equip.equipment_recipe_id}-${idx}`;

                    const timelineProj = timelineEquipments.find(
                      (te) =>
                        te.equipment_recipe_id == equip.equipment_recipe_id,
                    );

                    const isLocked = group.status !== "Em Planejamento";
                    const isExpanded = rowsExpands.includes(rowKey);

                    const components =
                      group.components?.filter(
                        (c) =>
                          String(c.budget_equipment_id) ===
                          String(equip.budget_equipment_id),
                      ) || [];

                    return (
                      <Fragment key={rowKey}>
                        <tr
                          onClick={() => toggleRow(rowKey)}
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
                                title={equip.equipment_name}
                              >
                                {equip.equipment_name}
                              </span>
                            </div>
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#5E6C84]">
                            {formatDate(timelineProj?.equipment_start_at)}
                          </td>

                          <td className="px-2 py-2 text-center text-[11px] text-[#5E6C84]">
                            {formatDate(timelineProj?.equipment_end_at)}
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
                                    confirm(`Remover ${equip.equipment_name}?`)
                                  ) {
                                    if (!equip.budget_equipment_id) {
                                      alert(
                                        "Não foi possível identificar o equipamento.",
                                      );
                                      return;
                                    }

                                    deleteMutation.mutate(
                                      equip.budget_equipment_id,
                                    );
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
                            const compKey = `${rowKey}-${comp.component_recipe_id}`;

                            const compTasks = timelineTasks.find(
                              (t) =>
                                t.component_recipe_id ==
                                comp.component_recipe_id,
                            );

                            return (
                              <tr
                                key={compKey}
                                className={`border-b border-[#EBECF0] ${
                                  index % 2 === 0 ? "bg-[#FAFBFC]" : "bg-white"
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
                                    className={dateInputClass}
                                    value={getInputValue(
                                      compKey,
                                      "start",
                                      compTasks?.planned_start_at,
                                    )}
                                    onChange={(e) =>
                                      handleInputChange(
                                        compKey,
                                        "start",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() =>
                                      handleDateSave(
                                        equip.budget_equipment_id,
                                        comp.component_recipe_id,
                                        compKey,
                                        "start",
                                      )
                                    }
                                    disabled={isLocked}
                                  />
                                </td>

                                <td className="px-2 py-1.5">
                                  <input
                                    type="date"
                                    className={dateInputClass}
                                    value={getInputValue(
                                      compKey,
                                      "end",
                                      compTasks?.planned_end_at,
                                    )}
                                    onChange={(e) =>
                                      handleInputChange(
                                        compKey,
                                        "end",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() =>
                                      handleDateSave(
                                        equip.budget_equipment_id,
                                        comp.component_recipe_id,
                                        compKey,
                                        "end",
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
                      <td colSpan={13} className="px-4 py-10 text-center">
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
