import React, { useMemo, useState, useEffect } from "react";

import StatusButton from "../../Ui/StatusButton";
import { vwEquipmentRecipesMaterialSummary } from "@services/ViewsService.js";

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};
export default function BudgetTimeline({
  currentBudget,
  allBudgets = [],
  searchTerm = "",
  timelineTasks = [],
  timelineEquipments = [],
  timelineBudgets = [],
}) {
  const [groupedTimelines, setGroupedTimelines] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const budgetsToProcess = currentBudget
        ? [currentBudget]
        : allBudgets || [];

      const results = [];

      for (const budget of budgetsToProcess) {
        const budgetId = budget.id || budget.budget_id;

        if (!budgetId) continue;

        try {
          const equipData = await vwEquipmentRecipesMaterialSummary(budgetId);

          const rawEquips = Array.isArray(equipData) ? equipData : [];

          const mergedEquips = rawEquips.map((equip) => {
            const timelineInfo = timelineEquipments.find(
              (timeline) =>
                String(timeline.equipment_recipe_id) ===
                String(equip.equipment_recipe_id),
            );

            return {
              ...equip,
              equipment_start_at:
                timelineInfo?.equipment_start_at || equip.equipment_start_at,
              equipment_end_at:
                timelineInfo?.equipment_end_at || equip.equipment_end_at,
            };
          });

          const filtered = searchTerm
            ? mergedEquips.filter((equip) =>
                (equip.recipe_name || "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
              )
            : mergedEquips;

          if (filtered.length > 0 || currentBudget) {
            results.push({
              budgetInfo: budget,
              equipments: filtered,
            });
          }
        } catch (error) {
          console.error(
            `Erro ao carregar timeline do orçamento ${budgetId}:`,
            error,
          );
        }
      }

      setGroupedTimelines(results);
    };

    loadData();
  }, [currentBudget, allBudgets, timelineEquipments, searchTerm]);

  const { startDate, endDate } = useMemo(() => {
    let minTime = Infinity;
    let maxTime = -Infinity;

    const checkDate = (dateString) => {
      if (!dateString) return;

      const date = new Date(dateString);

      if (isValidDate(date)) {
        const time = date.getTime();

        if (time < minTime) {
          minTime = time;
        }

        if (time > maxTime) {
          maxTime = time;
        }
      }
    };

    const budgetsChecking = currentBudget ? [currentBudget] : allBudgets;

    budgetsChecking.forEach((budget) => {
      const budgetTimeline = timelineBudgets.find(
        (timeline) =>
          String(timeline.budget_id) === String(budget.id || budget.budget_id),
      );

      if (budgetTimeline) {
        checkDate(budgetTimeline.project_start_at);

        checkDate(budgetTimeline.project_end_at);
      }
    });

    timelineTasks.forEach((task) => {
      checkDate(task.planned_start_at);
      checkDate(task.planned_end_at);
    });

    let start;
    let end;

    if (minTime !== Infinity) {
      start = new Date(minTime);
      start.setDate(start.getDate() - 2);
    } else {
      start = new Date();
    }

    if (maxTime !== -Infinity) {
      end = new Date(maxTime);
      end.setDate(end.getDate() + 2);
    } else {
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    }

    if (end <= start) {
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    }

    return {
      startDate: start,
      endDate: end,
    };
  }, [currentBudget, allBudgets, timelineBudgets, timelineTasks]);

  const timelineDates = useMemo(() => {
    const dates = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(3, 0, 0, 0);
    end.setHours(3, 0, 0, 0);

    let current = new Date(start);
    let safety = 0;

    while (current <= end && safety < 730) {
      dates.push(new Date(current));

      current.setDate(current.getDate() + 1);

      safety++;
    }

    return dates;
  }, [startDate, endDate]);

  const isDateInRange = (date, startString, endString) => {
    if (!startString) return false;

    try {
      const columnDate = new Date(date).toISOString().split("T")[0];

      let start = new Date(startString);
      let end = endString ? new Date(endString) : start;

      if (end < start) {
        const temp = start;
        start = end;
        end = temp;
      }

      const startDateString = start.toISOString().split("T")[0];

      const endDateString = end.toISOString().split("T")[0];

      return columnDate >= startDateString && columnDate <= endDateString;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  if (timelineDates.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-white">
        <p className="text-sm text-[#5E6C84]">Carregando cronograma...</p>
      </div>
    );
  }

  if (groupedTimelines.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-white">
        <p className="text-sm text-[#5E6C84]">  
          Nenhum dado encontrado para exibição.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col pb-2">
      {groupedTimelines.map((group) => (
        <div
          key={group.budgetInfo.id || group.budgetInfo.budget_id}
          className="flex w-full flex-col"
        >
          {!currentBudget && (
            <div className="flex items-center justify-between border border-[#DFE1E6] bg-white px-3 py-2">
              <h2 className="truncate text-sm font-semibold text-[#172B4D]">
                {group.budgetInfo.name || group.budgetInfo.budget_name}
              </h2>

              <span className="ml-3 shrink-0 rounded-full bg-[#F4F5F7] px-2 py-1 text-[10px] font-semibold text-[#5E6C84]">
                {group.budgetInfo.status}
              </span>
            </div>
          )}

          <div className="w-full overflow-x-auto border border-[#DFE1E6] bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                  <th className="sticky left-0 z-20 min-w-[190px] border-r border-[#DFE1E6] bg-[#F4F5F7] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                    Item
                  </th>

                  {timelineDates.map((date, index) => (
                    <th
                      key={index}
                      className="min-w-[52px] border-r border-[#EBECF0] px-1 py-2 text-center text-[9px] font-medium text-[#5E6C84] last:border-r-0"
                    >
                      {formatDateHeader(date)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {group.equipments.map((equip) => {
                  const equipmentTasks = timelineTasks.filter(
                    (task) =>
                      String(task.equipment_recipe_id) ===
                      String(equip.equipment_recipe_id),
                  );

                  return (
                    <React.Fragment key={equip.equipment_recipe_id}>
                      <tr className="border-b border-[#EBECF0] bg-white">
                        <td className="sticky left-0 z-10 min-w-[190px] border-r border-[#DFE1E6] bg-white px-3 py-2">
                          <span
                            className="block max-w-[180px] truncate text-xs font-semibold text-[#172B4D]"
                            title={equip.recipe_name}
                          >
                            {equip.recipe_name}
                          </span>
                        </td>

                        {timelineDates.map((date, index) => (
                          <td
                            key={index}
                            className={`h-9 border-r border-[#EBECF0] p-0 text-center last:border-r-0 ${
                              isWeekend(date) ? "bg-red-500" : ""
                            }`}
                          >
                            {!isWeekend(date) &&
                              isDateInRange(
                                date,
                                equip?.equipment_start_at,
                                equip?.equipment_end_at,
                              ) && (
                                <div className="flex h-full items-center justify-center">
                                  <StatusButton status="Pending" />
                                </div>
                              )}
                          </td>
                        ))}
                      </tr>

                      {equipmentTasks.map((task) => (
                        <tr
                          key={
                            task.task_id ||
                            `${equip.equipment_recipe_id}-${task.component_recipe_id}`
                          }
                          className="border-b border-[#EBECF0] bg-[#FAFBFC] transition-colors hover:bg-[#F4F5F7]"
                        >
                          <td className="sticky left-0 z-10 min-w-[190px] border-r border-[#DFE1E6] bg-[#FAFBFC] px-3 py-1.5 pl-7">
                            <span
                              className="block max-w-[165px] truncate text-[10px] text-[#5E6C84]"
                              title={task.component_name}
                            >
                              {task.component_name}
                            </span>
                          </td>

                          {timelineDates.map((date, index) => (
                            <td
                              key={index}
                              className={`h-8 border-r border-[#EBECF0] p-0 text-center last:border-r-0 ${
                                isWeekend(date) ? "bg-red-500" : ""
                              }`}
                            >
                              {!isWeekend(date) &&
                                isDateInRange(
                                  date,
                                  task?.planned_start_at,
                                  task?.planned_end_at,
                                ) && (
                                  <div className="flex h-full items-center justify-center">
                                    <StatusButton status="Pending" />
                                  </div>
                                )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {group.equipments.length === 0 && (
                  <tr>
                    <td
                      colSpan={timelineDates.length + 1}
                      className="px-4 py-10 text-center"
                    >
                      <p className="text-sm font-medium text-[#172B4D]">
                        Nenhum equipamento neste orçamento
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
