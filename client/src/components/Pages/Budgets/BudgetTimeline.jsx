import React, { useMemo, useState, useEffect } from "react";
import StatusButton from "../../Ui/StatusButton";
import { vwEquipmentRecipesMaterialSummary } from "@services/ViewsService.js";

// --- Helpers ---
const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
};

export default function BudgetTimeline({
  currentBudget,
  allBudgets = [], // Recebe a lista completa de orçamentos
  searchTerm = "",
  timelineTasks = [],
  timelineEquipments = [],
  timelineBudgets = [],
}) {
  // Estado para armazenar dados agrupados por orçamento
  // Formato: [{ budgetInfo: {}, equipments: [] }, ...]
  const [groupedTimelines, setGroupedTimelines] = useState([]);

  // 1. CARREGAMENTO DOS DADOS (Lógica Multiorçamento)
  useEffect(() => {
    const loadData = async () => {
      // Define quem deve ser processado: O atual ou todos
      const budgetsToProcess = currentBudget
        ? [currentBudget]
        : allBudgets || [];

      const results = [];

      for (const bud of budgetsToProcess) {
        // Garante que temos um ID válido
        const budgetId = bud.id || bud.budget_id;
        if (!budgetId) continue;

        try {
          // Busca os equipamentos exatos deste orçamento (igual à tabela de materiais)
          const equipData = await vwEquipmentRecipesMaterialSummary(budgetId);
          const rawEquips = Array.isArray(equipData) ? equipData : [];

          // Faz o MERGE com as datas globais (timelineEquipments)
          // Isso prepara os dados já com as datas certas para renderizar
          const mergedEquips = rawEquips.map((equip) => {
            const timelineInfo = timelineEquipments.find(
              (t) =>
                String(t.equipment_recipe_id) ===
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

          // Filtro de Busca (aplica-se individualmente a cada grupo)
          const filtered = searchTerm
            ? mergedEquips.filter((e) =>
                (e.recipe_name || "")
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
              )
            : mergedEquips;

          // Só adiciona se tiver equipamentos ou se for o único orçamento selecionado
          if (filtered.length > 0 || currentBudget) {
            results.push({
              budgetInfo: bud,
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

  // 2. Lógica de Datas Globais (Define o range do cabeçalho para TODOS os gráficos)
  const { startDate, endDate } = useMemo(() => {
    let minTime = Infinity;
    let maxTime = -Infinity;

    const checkDate = (dateStr) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isValidDate(d)) {
        const time = d.getTime();
        if (time < minTime) minTime = time;
        if (time > maxTime) maxTime = time;
      }
    };

    // Verifica datas de todos os projetos disponíveis para definir o limite visual
    const budgetsChecking = currentBudget ? [currentBudget] : allBudgets;
    budgetsChecking.forEach((b) => {
      // Tenta achar as datas na lista de timelines de orçamentos
      const bTimeline = timelineBudgets.find(
        (tb) => String(tb.budget_id) === String(b.id || b.budget_id),
      );
      if (bTimeline) {
        checkDate(bTimeline.project_start_at);
        checkDate(bTimeline.project_end_at);
      }
    });

    // Datas das tarefas (expandem o gráfico se necessário)
    timelineTasks.forEach((t) => {
      checkDate(t.planned_start_at);
      checkDate(t.planned_end_at);
    });

    let start, end;
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
    return { startDate: start, endDate: end };
  }, [currentBudget, allBudgets, timelineBudgets, timelineTasks]);

  // 3. Array de dias (Colunas)
  const timelineDates = useMemo(() => {
    const dates = [];
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(3, 0, 0, 0);
    e.setHours(3, 0, 0, 0);

    let curr = new Date(s);
    let safety = 0;
    while (curr <= e && safety < 730) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
      safety++;
    }
    return dates;
  }, [startDate, endDate]);

  // 4. Funções de Apoio (Renderização)
  const isDateInRange = (date, startStr, endStr) => {
    if (!startStr) return false;
    try {
      const colDate = new Date(date).toISOString().split("T")[0];
      let d1 = new Date(startStr);
      let d2 = endStr ? new Date(endStr) : d1;
      if (d2 < d1) {
        const temp = d1;
        d1 = d2;
        d2 = temp;
      }
      const start = d1.toISOString().split("T")[0];
      const end = d2.toISOString().split("T")[0];
      return colDate >= start && colDate <= end;
    } catch (e) {
      console.error(e)
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

  if (timelineDates.length === 0)
    return <div className="text-gray-500 p-4">Carregando cronograma...</div>;
  if (groupedTimelines.length === 0)
    return (
      <div className="text-gray-500 p-4">
        Nenhum dado encontrado para exibição.
      </div>
    );

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* ITERAÇÃO SOBRE OS GRUPOS (ORÇAMENTOS) */}
      {groupedTimelines.map((group) => (
        <div
          key={group.budgetInfo.id || group.budgetInfo.budget_id}
          className="flex flex-col gap-2"
        >
          {/* Cabeçalho do Orçamento (Só aparece se não tiver um selecionado especificamente, ou para reforçar) */}
          {!currentBudget && (
            <h2 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-2 mt-2">
              {group.budgetInfo.name || group.budgetInfo.budget_name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({group.budgetInfo.status})
              </span>
            </h2>
          )}

          <div className="w-full max-w-[calc(100vw-280px)] overflow-x-auto pb-2 border border-gray-200 rounded-lg shadow-sm bg-white">
            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="sticky left-0 z-20 px-4 py-3 bg-gray-50 border-r border-gray-200 min-w-[200px]">
                    Item
                  </th>
                  {timelineDates.map((date, index) => (
                    <th
                      key={index}
                      className="px-2 py-3 min-w-[50px] text-center font-medium text-gray-500 border-r border-gray-100 last:border-0"
                    >
                      {formatDateHeader(date)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {group.equipments.map((equip) => {
                  // Filtra as tarefas deste equipamento
                  const tasksDoEquipamento = timelineTasks.filter((t) => {
                    return (
                      String(t.equipment_recipe_id) ===
                      String(equip.equipment_recipe_id)
                    );
                  });

                  return (
                    <React.Fragment
                      key={equip.equipment_recipe_id || Math.random()}
                    >
                      {/* Linha do Equipamento */}
                      <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-100 transition-colors">
                        <td className="sticky left-0 z-10 font-bold text-gray-800 bg-white border-r border-gray-200 px-4">
                          {equip.recipe_name}
                        </td>
                        {timelineDates.map((date, index) => (
                          <td
                            key={index}
                            className="text-center border-r border-gray-200/50 last:border-0 p-0 h-10"
                          >
                            {isDateInRange(
                              date,
                              equip?.equipment_start_at,
                              equip?.equipment_end_at,
                            ) && <StatusButton status="Pending" />}
                          </td>
                        ))}
                      </tr>

                      {/* Linhas das Tarefas */}
                      {tasksDoEquipamento.map((comp) => (
                        <tr
                          key={comp.task_id || Math.random()}
                          className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="sticky left-0 z-10 text-gray-600 bg-white border-r border-gray-200 px-4 pl-8">
                            <div className="flex items-center gap-2 text-xs">
                              {comp.component_name}
                            </div>
                          </td>
                          {timelineDates.map((date, index) => (
                            <td
                              key={index}
                              className="text-center border-r border-gray-100 last:border-0 p-0 h-8"
                            >
                              {isDateInRange(
                                date,
                                comp?.planned_start_at,
                                comp?.planned_end_at,
                              ) && <StatusButton status="Pending" />}
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
                      className="text-center p-4 text-gray-500"
                    >
                      Nenhum equipamento neste orçamento.
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
