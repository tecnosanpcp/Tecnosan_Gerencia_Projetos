import React, { useMemo } from "react";
import StatusButton from "../../Ui/StatusButton";

export default function ProjectTimeline({
  currentBudget,
  searchTerm = "",
  timelineTasks = [],
  timelineEquipments = [],
  timelineBudgets = [],
}) {
  
  // 1. LÓGICA: Encontrar o orçamento atual
  const currentBudgetTimeline = useMemo(() => {
    return timelineBudgets.find((b) => b.budget_id === currentBudget?.id);
  }, [timelineBudgets, currentBudget]);

  // 2. LÓGICA: Geração das datas
  const timelineDates = useMemo(() => {
    if (!currentBudgetTimeline?.project_start_at) return [];

    const start = new Date(currentBudgetTimeline.project_start_at);
    const end = currentBudgetTimeline.project_end_at
      ? new Date(currentBudgetTimeline.project_end_at)
      : new Date(start);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) end.setDate(end.getDate() + 30);

    const dates = [];
    let curr = new Date(start);
    let safety = 0;

    while (curr <= end && safety < 365) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
      safety++;
    }
    return dates;
  }, [currentBudgetTimeline]);

  // 3. LÓGICA: Verificação de Intervalo
  const isDateInRange = (date, startStr, endStr) => {
    if (!startStr || !endStr) return false;
    
    const checkTime = date.getTime();
    
    const startDate = new Date(startStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endStr);
    endDate.setHours(0, 0, 0, 0);

    return checkTime >= startDate.getTime() && checkTime <= endDate.getTime();
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (!currentBudgetTimeline) {
    return <div className="text-gray-500 p-4">Selecione um orçamento para visualizar o cronograma.</div>;
  }

  return (
    <div 
      className="w-full max-w-[calc(100vw-280px)] overflow-x-auto pb-4 border border-gray-200 rounded-lg 
      [&::-webkit-scrollbar]:h-2 
      [&::-webkit-scrollbar]:w-2 
      [&::-webkit-scrollbar-track]:bg-[#f1f1f1] 
      [&::-webkit-scrollbar-track]:rounded 
      [&::-webkit-scrollbar-thumb]:bg-slate-300 
      [&::-webkit-scrollbar-thumb]:rounded 
      [&::-webkit-scrollbar-thumb]:hover:bg-slate-400"
    >
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
          {timelineEquipments
            .filter((equip) =>
              equip?.recipe_name?.toLowerCase()?.includes(searchTerm.toLowerCase())
            )
            .map((equip) => {
              const tasksDoEquipamento = timelineTasks.filter(
                (t) => t.equipment_recipe_id == equip.equipment_recipe_id
              );

              return (
                <React.Fragment key={equip.equipment_recipe_id}>
                  {/* LINHA DO EQUIPAMENTO */}
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
                          equip?.equipment_end_at
                        ) && <StatusButton status="Pending" />}
                      </td>
                    ))}
                  </tr>

                  {/* LINHAS DOS COMPONENTES */}
                  {tasksDoEquipamento.map((comp) => (
                    <tr
                      key={comp.task_id}
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
                            comp?.planned_end_at
                          ) && <StatusButton status="Pending" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}