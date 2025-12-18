import React, { useEffect, useState, useContext } from "react";
import StatusButton from "../../Ui/StatusButton";
import { getEquipment } from "@services/EquipmentService";
import { getComponents } from "@services/ComponentsServices";
import { vwSummaryStatus } from "@services/ViewsSummary";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

// eslint-disable-next-line no-unused-vars
export default function BudgetTimeline({ searchTerm, times }) {
  const [equipments, setEquipments] = useState([]);
  const [components, setComponents] = useState([]);
  const [timelineDates, setTimelineDates] = useState([]);
  const [status, setStatus] = useState([]);

  const { currentProject } = useContext(selectedProjectContext);

  useEffect(() => {
    const loadData = async () => {
      if (currentProject?.id) {
        const equipment_data = await getEquipment(currentProject.id);
        setEquipments(equipment_data || []);
      }
      const component_data = await getComponents();
      setComponents(component_data || []);

      const status_data = await vwSummaryStatus();
      setStatus(status_data);
    };

    const dateLoader = () => {
      const finalDateRaw = currentProject?.end_date || currentProject?.deadline;

      if (currentProject?.start_date && finalDateRaw) {
        const datesArray = [];
        const startDate = new Date(currentProject.start_date);
        const endDate = new Date(finalDateRaw);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let currentDate = new Date(startDate);
        let safety = 0;

        while (currentDate <= endDate && safety < 1000) {
          datesArray.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
          safety++;
        }
        setTimelineDates(datesArray);
      }
    };

    loadData();
    dateLoader();
  }, [currentProject]);

  // Função utilitária para verificar se a data está no range
  const isDateInRange = (date, startStr, endStr) => {
    if (!startStr || !endStr) return false;
    const current = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(startStr).setHours(0, 0, 0, 0);
    const end = new Date(endStr).setHours(0, 0, 0, 0);
    return current >= start && current <= end;
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (!equipments)
    return <div className="text-gray-500 p-4">Carregando dados...</div>;
  if (timelineDates.length === 0 && currentProject)
    return <div className="text-gray-500 p-4">Gerando cronograma...</div>;

  return (
    <div className="w-full max-w-[calc(100vw-280px)] overflow-x-auto pb-4 border border-gray-200 rounded-lg">
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
          {equipments.map((equip) => {
            const status_equip = status?.equipments?.find(
              (e) => e.equipment_id == equip.equipment_id
            );
            const time_equip = times?.equipments?.[equip.equipment_id];

            return (
              <React.Fragment key={equip.equipment_id}>
                {/* LINHA DO EQUIPAMENTO */}
                <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-100 transition-colors">
                  <td className="sticky left-0 z-10 font-bold text-gray-800 bg-white border-r border-gray-200 px-4">
                    {equip.equipment_name}
                  </td>
                  {timelineDates.map((date, index) => (
                    <td
                      key={index}
                      className="text-center border-r border-gray-200/50 last:border-0 p-0 h-10"
                    >
                      {isDateInRange(
                        date,
                        time_equip?.start_date,
                        time_equip?.end_date
                      ) && <StatusButton status={status_equip?.status} />}
                    </td>
                  ))}
                </tr>

                {/* LINHAS DOS COMPONENTES */}
                {components
                  .filter((c) => c.equipment_id === equip.equipment_id)
                  .map((comp) => {
                    const status_comp = status?.components?.find(
                      (c) => c.component_id == comp.component_id
                    );
                    const time_comp = times?.components?.[comp.component_id];

                    return (
                      <tr
                        key={comp.component_id}
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
                              time_comp?.start_date,
                              time_comp?.end_date
                            ) && <StatusButton status={status_comp?.status} />}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
