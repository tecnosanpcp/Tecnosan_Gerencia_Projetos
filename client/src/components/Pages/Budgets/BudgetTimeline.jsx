import React, { useMemo, useState, useEffect } from "react";
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
  groupedData = [],
  timelineTasks = [],
  timelineEquipments = [],
  timelineBudgets = [],
}) {
  const [groupedTimelines, setGroupedTimelines] = useState([]);

  const [collapsedEquipments, setCollapsedEquipments] = useState({});

  const toggleEquipment = (id) => {
    setCollapsedEquipments((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const expandAll = () => setCollapsedEquipments({});

  const collapseAll = () => {
    const collapsed = {};

    groupedTimelines.forEach((group) => {
      group.equipments.forEach((equip) => {
        collapsed[equip.budget_equipment_id] = true;
      });
    });

    setCollapsedEquipments(collapsed);
  };

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
                String(timeline.budget_equipment_id) ===
                String(equip.budget_equipment_id),
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
                (equip.equipment_name || "")
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
    console.log("[GANTT ORIGEM DAS DATAS]", {
      budget: timelineBudgets
        .filter((item) => String(item.budget_id) === "39")
        .map((item) => ({
          budget_id: item.budget_id,
          inicio: item.project_start_at,
          fim: item.project_end_at,
        })),

      tasks: timelineTasks
        .filter((item) => String(item.budget_id) === "39")
        .map((item) => ({
          budget_equipment_id: item.budget_equipment_id,
          component_name: item.component_name,
          inicio: item.planned_start_at,
          fim: item.planned_end_at,
        })),
    });
    timelineTasks
      .filter((task) =>
        budgetsChecking.some(
          (budget) =>
            String(task.budget_id) === String(budget.id ?? budget.budget_id),
        ),
      )
      .forEach((task) => {
        checkDate(task.planned_start_at);
        checkDate(task.planned_end_at);
      });

    let start;
    let end;

    if (minTime !== Infinity) {
      start = new Date(minTime);
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
    const weekday = date
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "");

    const dayMonth = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium capitalize">{weekday}</span>
        <span className="text-[11px] font-semibold">{dayMonth}</span>
      </div>
    );
  };

  const formatPeriod = (start, end) => {
    if (!start) return "—";

    const format = (value) =>
      new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
      });

    return `${format(start)} – ${format(end || start)}`;
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
    <div className="flex w-full flex-col">
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

          <div className="w-full overflow-hidden bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE1E6] bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#172B4D]">
                  Cronograma de produção
                </span>
                <span className="rounded-full bg-[#EAF2FF] px-2 py-1 text-[11px] font-medium text-[#0052CC]">
                  {group.equipments.length} equipamentos
                </span>
              </div>

              <div className="flex flex-nowrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-md border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#42526E] hover:bg-[#F4F5F7]"
                >
                  Expandir tudo
                </button>

                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-md border border-[#DFE1E6] px-3 py-1.5 text-xs font-medium text-[#42526E] hover:bg-[#F4F5F7]"
                >
                  Recolher tudo
                </button>
              </div>
            </div>

            <div className="max-h-[65vh] w-full overflow-auto">
              <table className="w-max min-w-full border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-[#F4F6FA]">
                    <th className="sticky left-0 z-40 min-w-[280px] w-[280px] border-b border-r border-[#DFE1E6] bg-[#F4F6FA] px-4 py-3 text-left text-[11px] font-semibold uppercase text-[#42526E]">
                      Atividade
                    </th>

                    <th className="sticky left-[280px] z-40 min-w-[125px] border-b border-r border-[#DFE1E6] bg-[#F4F6FA] px-3 py-3 text-center text-[11px] font-semibold uppercase text-[#42526E]">
                      Período
                    </th>

                    {timelineDates.map((date, index) => (
                      <th
                        key={index}
                        className={`min-w-[48px] border-b border-r border-[#DFE1E6] px-1 py-2 text-center ${
                          isWeekend(date)
                            ? "bg-[#FFF0EE] text-[#BF2600]"
                            : "bg-[#F4F6FA] text-[#42526E]"
                        }`}
                      >
                        {formatDateHeader(date)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {group.equipments.map((equip) => {
                    const budgetGroup = groupedData.find(
                      (item) =>
                        String(item.budget_id) ===
                        String(
                          group.budgetInfo.id || group.budgetInfo.budget_id,
                        ),
                    );

                    const equipmentTasks = (budgetGroup?.components || [])
                      .filter(
                        (comp) =>
                          String(comp.budget_equipment_id) ===
                          String(equip.budget_equipment_id),
                      )
                      .map((comp) => {
                        const task = timelineTasks.find(
                          (item) =>
                            String(item.budget_equipment_id) ===
                              String(equip.budget_equipment_id) &&
                            String(item.component_recipe_id) ===
                              String(comp.component_recipe_id),
                        );

                        return {
                          ...task,
                          ...comp,
                          component_name:
                            task?.component_name || comp.recipe_name,
                        };
                      });

                    return (
                      <React.Fragment key={equip.budget_equipment_id}>
                        <tr className="group border-b border-[#DFE1E6] bg-[#EAF2FF]">
                          <td className="sticky left-0 z-20 min-w-[280px] w-[280px] border-b border-r border-[#DFE1E6] bg-[#EAF2FF] px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleEquipment(equip.budget_equipment_id)
                              }
                              className="flex w-full items-center gap-2 text-left"
                            >
                              <span className="text-[#0052CC]">
                                {collapsedEquipments[equip.budget_equipment_id]
                                  ? "▸"
                                  : "▾"}
                              </span>

                              

                              <span
                                className="block truncate text-xs font-semibold text-[#172B4D]"
                                title={equip.equipment_name}
                              >
                                {equip.equipment_name}
                              </span>
                            </button>
                          </td>

                          <td className="sticky left-[280px] z-20 min-w-[125px] border-b border-r border-[#DFE1E6] bg-[#EAF2FF] px-2 text-center text-[10px] font-semibold text-[#253858]">
                            {formatPeriod(
                              equip.equipment_start_at,
                              equip.equipment_end_at,
                            )}
                          </td>

                          {timelineDates.map((date, index) => {
                            const active =
                              !isWeekend(date) &&
                              isDateInRange(
                                date,
                                equip.equipment_start_at,
                                equip.equipment_end_at,
                              );

                            return (
                              <td
                                key={index}
                                className={`h-10 min-w-[48px] border-b border-r border-[#EBECF0] p-0 ${
                                  isWeekend(date)
                                    ? "bg-[#FFF0EE]"
                                    : "bg-[#EAF2FF]"
                                }`}
                              >
                                {active && (
                                  <div
                                    className="my-[10px] h-5 bg-[#0052CC]"
                                    title={`${equip.equipment_name}: ${formatPeriod(
                                      equip.equipment_start_at,
                                      equip.equipment_end_at,
                                    )}`}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {!collapsedEquipments[equip.budget_equipment_id] &&
                          equipmentTasks.map((task) => (
                            <tr
                              key={
                                task.task_id ||
                                `${equip.budget_equipment_id}-${task.component_recipe_id}`
                              }
                              className="group bg-white transition-colors hover:bg-[#F7F9FC]"
                            >
                              <td className="sticky left-0 z-20 min-w-[280px] w-[280px] border-b border-r border-[#EBECF0] bg-white py-2 pl-10 pr-3 group-hover:bg-[#F7F9FC]">
                                <span
                                  className="block truncate text-[11px] text-[#42526E]"
                                  title={task.component_name}
                                >
                                  {task.component_name}
                                </span>
                              </td>

                              <td className="sticky left-[280px] z-20 min-w-[125px] border-b border-r border-[#EBECF0] bg-white px-2 text-center text-[10px] text-[#5E6C84] group-hover:bg-[#F7F9FC]">
                                {formatPeriod(
                                  task.planned_start_at,
                                  task.planned_end_at,
                                )}
                              </td>

                              {timelineDates.map((date, index) => {
                                const active =
                                  !isWeekend(date) &&
                                  isDateInRange(
                                    date,
                                    task.planned_start_at,
                                    task.planned_end_at,
                                  );

                                return (
                                  <td
                                    key={index}
                                    className={`h-9 min-w-[48px] border-b border-r border-[#EBECF0] p-0 ${
                                      isWeekend(date)
                                        ? "bg-[#FFF0EE]"
                                        : "bg-white"
                                    }`}
                                  >
                                    {active && (
                                      <div
                                        className="my-[11px] h-[14px] bg-[#69A5F8]"
                                        title={`${task.component_name}: ${formatPeriod(
                                          task.planned_start_at,
                                          task.planned_end_at,
                                        )}`}
                                      />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}

                  {group.equipments.length === 0 && (
                    <tr>
                      <td
                        colSpan={timelineDates.length + 2}
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
        </div>
      ))}
    </div>
  );
}
