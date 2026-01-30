import React, { useEffect, useState, useContext } from "react";
import StatusButton from "../../Ui/StatusButton";
import { getEquipment } from "@services/EquipmentService";
import { getComponents } from "@services/ComponentsServices";
import { listProjects } from "@services/ProjectService";
import { VerifyAuth } from "@services/AuthService";
import { vwSummaryStatus } from "@services/ViewsSummary";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

// --- Helpers ---
const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
};

// Busca segura (Array ou Objeto)
const getDataSafe = (source, type, id) => {
  if (!source || !source[type]) return null;
  const collection = source[type];

  if (Array.isArray(collection)) {
    if (type === "equipments")
      return collection.find(
        (item) => String(item.equipment_id) === String(id),
      );
    if (type === "components")
      return collection.find(
        (item) => String(item.component_id) === String(id),
      );
    return null;
  }
  return collection[id];
};

export default function ProjectTimeline({ searchTerm, times }) {
  // Estado agrupado: [{ projectInfo: {}, equipments: [] }, ...]
  const [groupedData, setGroupedData] = useState([]);

  // Mantemos componentes e status globais
  const [components, setComponents] = useState([]);
  const [status, setStatus] = useState([]);

  // OBS: Removemos o state 'timelineDates' global, pois agora é calculado por projeto.

  const { currentProject } = useContext(selectedProjectContext);

  // 1. CARREGAMENTO DE DADOS
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await VerifyAuth();

        // Determina a lista de projetos a processar
        let projectsToProcess = [];

        if (currentProject?.id) {
          projectsToProcess = [currentProject];
        } else {
          const all = await listProjects(user.user_id);
          projectsToProcess = Array.isArray(all) ? all : [];
        }

        const results = [];

        for (const proj of projectsToProcess) {
          if (!proj.id && !proj.project_id) continue;
          const pid = proj.id || proj.project_id;

          try {
            const equipsRaw = await getEquipment(pid);
            const equipsArray = Array.isArray(equipsRaw) ? equipsRaw : [];

            const filteredEquips = searchTerm
              ? equipsArray.filter((e) =>
                  (e.equipment_name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
                )
              : equipsArray;

            if (filteredEquips.length > 0 || currentProject?.id) {
              results.push({
                projectInfo: proj,
                equipments: filteredEquips,
              });
            }
          } catch (err) {
            console.error(
              `Erro ao carregar equipamentos do projeto ${pid}`,
              err,
            );
          }
        }

        setGroupedData(results);

        const component_data = await getComponents();
        setComponents(Array.isArray(component_data) ? component_data : []);

        const status_data = await vwSummaryStatus();
        setStatus(status_data || {});
      } catch (error) {
        console.error("Erro geral ao carregar dados:", error);
      }
    };

    loadData();
  }, [currentProject, searchTerm]);

  // --- FUNÇÃO PARA GERAR DATAS ESPECÍFICAS DE CADA PROJETO ---
  const getProjectTimelineDates = (project) => {
    let start, end;

    // 1. Início (Data do Projeto ou Hoje)
    if (project?.start_date && isValidDate(new Date(project.start_date))) {
      start = new Date(project.start_date);
    } else {
      start = new Date();
    }

    // 2. Fim (End Date, Deadline ou +30 dias)
    const rawEnd = project?.end_date || project?.deadline;
    if (rawEnd && isValidDate(new Date(rawEnd))) {
      end = new Date(rawEnd);
    } else {
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    }

    // 3. Margens de Segurança (-2 dias antes, +2 dias depois)
    start.setDate(start.getDate() - 2);
    end.setDate(end.getDate() + 2);

    // 4. Validação (se Fim < Início, joga +30)
    if (end <= start) {
      end = new Date(start);
      end.setDate(end.getDate() + 30);
    }

    // 5. Gera Array
    const dates = [];
    // Ajuste de horas para evitar problemas de fuso/virada de dia
    const s = new Date(start);
    s.setHours(3, 0, 0, 0);
    const e = new Date(end);
    e.setHours(3, 0, 0, 0);

    let cur = new Date(s);
    let safety = 0;
    // Limite de segurança de 1 ano (366 dias) para não travar o browser
    while (cur <= e && safety < 366) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      safety++;
    }
    return dates;
  };

  // --- HELPERS DE RENDERIZAÇÃO ---
  const isDateInRange = (date, startStr, endStr) => {
    if (!startStr) return false;
    try {
      const colDate = new Date(date).toISOString().split("T")[0];
      let d1 = new Date(startStr);
      let d2 = endStr ? new Date(endStr) : d1;
      if (d2 < d1) {
        const t = d1;
        d1 = d2;
        d2 = t;
      }
      const start = d1.toISOString().split("T")[0];
      const end = d2.toISOString().split("T")[0];
      return colDate >= start && colDate <= end;
    } catch (e) {
      console.error(e);
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

  if (groupedData.length === 0 && !currentProject)
    return <div className="text-gray-500 p-4">Nenhum projeto encontrado.</div>;

  return (
    <div className="flex flex-col gap-8 pb-4">
      {groupedData.map((group) => {
        // GERA AS DATAS ESPECÍFICAS PARA ESTE PROJETO
        const projectDates = getProjectTimelineDates(group.projectInfo);

        return (
          <div
            key={group.projectInfo.id || group.projectInfo.project_id}
            className="flex flex-col gap-2"
          >
            {/* Título do Projeto */}
            {!currentProject && (
              <h2 className="text-lg font-bold text-gray-700 border-l-4 border-green-500 pl-2 mt-2">
                {group.projectInfo.name || group.projectInfo.project_name}
                <span className="text-xs font-normal text-gray-400 ml-2 uppercase border border-gray-200 rounded px-1">
                  {group.projectInfo.status || "Status N/A"}
                </span>
              </h2>
            )}

            <div className="w-full max-w-[calc(100vw-280px)] overflow-x-auto pb-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                {/* CABEÇALHO COM DATAS DO PROJETO */}
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="sticky left-0 z-20 px-4 py-3 bg-gray-50 border-r border-gray-200 min-w-[200px]">
                      Item
                    </th>
                    {projectDates.map((date, index) => (
                      <th
                        key={index}
                        className="px-2 py-3 min-w-[40px] text-center font-medium text-gray-500 border-r border-gray-100 last:border-0"
                      >
                        {formatDateHeader(date)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {group.equipments.map((equip) => {
                    const status_equip = getDataSafe(
                      status,
                      "equipments",
                      equip.equipment_id,
                    );
                    const time_equip = getDataSafe(
                      times,
                      "equipments",
                      equip.equipment_id,
                    );

                    const equipStart =
                      time_equip?.planned_start ||
                      time_equip?.real_start ||
                      time_equip?.start_date;
                    const equipEnd =
                      time_equip?.planned_end ||
                      time_equip?.real_end ||
                      time_equip?.end_date;

                    return (
                      <React.Fragment key={equip.equipment_id}>
                        {/* Linha do Equipamento */}
                        <tr className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-100 transition-colors">
                          <td className="sticky left-0 z-10 font-bold text-gray-800 bg-white border-r border-gray-200 px-4">
                            {equip.equipment_name}
                          </td>
                          {projectDates.map((date, index) => (
                            <td
                              key={index}
                              className="text-center border-r border-gray-200/50 last:border-0 p-0 h-10"
                            >
                              {isDateInRange(date, equipStart, equipEnd) && (
                                <StatusButton status={status_equip?.status} />
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Componentes */}
                        {components
                          .filter((c) => c.equipment_id === equip.equipment_id)
                          .map((comp) => {
                            const status_comp = getDataSafe(
                              status,
                              "components",
                              comp.component_id,
                            );
                            const time_comp = getDataSafe(
                              times,
                              "components",
                              comp.component_id,
                            );

                            const compStart =
                              time_comp?.planned_start ||
                              time_comp?.real_start ||
                              time_comp?.start_date;
                            const compEnd =
                              time_comp?.planned_end ||
                              time_comp?.real_end ||
                              time_comp?.end_date;

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
                                {projectDates.map((date, index) => (
                                  <td
                                    key={index}
                                    className="text-center border-r border-gray-100 last:border-0 p-0 h-8"
                                  >
                                    {isDateInRange(
                                      date,
                                      compStart,
                                      compEnd,
                                    ) && (
                                      <StatusButton
                                        status={status_comp?.status}
                                      />
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}

                  {group.equipments.length === 0 && (
                    <tr>
                      <td
                        colSpan={projectDates.length + 1}
                        className="text-center p-4 text-gray-500"
                      >
                        Nenhum equipamento cadastrado neste projeto.
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
