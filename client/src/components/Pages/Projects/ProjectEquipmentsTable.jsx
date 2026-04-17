import { useState, useMemo, useContext, Fragment } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStatus, updateCompletionDate } from "@services/ComponentsServices.js";
import { selectedProjectContext } from "@content/SeletedProject.jsx";
import { formatDateForInput } from "@utils/dateUtils.js";
import SelectMenu from "../../Ui/SelectMenu.jsx";

// --- FUNÇÕES AUXILIARES (Definidas aqui para evitar erros de no-undef) ---

function TotalEquipmentMaterial(equipment) {
  if (!equipment?.components) return {};
  const totals = {};
  equipment.components.forEach((comp) => {
    comp.materials.forEach((mat) => {
      if (!totals[mat.material_id]) {
        totals[mat.material_id] = {
          id: mat.material_id,
          name: mat.material_name,
          qtd: Number(mat.total_material_consumed),
          value: Number(mat.total_value),
        };
      } else {
        totals[mat.material_id].qtd += Number(mat.total_material_consumed);
        totals[mat.material_id].value += Number(mat.total_value);
      }
    });
  });
  return totals;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function sumEquipmentValue(equip_totals) {
  const values = Object.values(equip_totals);
  if (values.length === 0) return "R$ 0,00";
  return values
    .reduce((sum, mat) => sum + Number(mat.value), 0)
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status) {
  switch (status) {
    case "Pending": return "Pendente";
    case "Completed": return "Concluído";
    case "Running": return "Em Andamento";
    case "Delayed": return "Atrasado";
    case "Failed": return "Não Concluído";
    default: return "Sem Status";
  }
}

// --- COMPONENTE PRINCIPAL ---

export default function ProjectEquipmentsTable({ 
  times, 
  searchTerm, 
  materialsSummary, 
  statusSummary 
}) {
  const queryClient = useQueryClient();
  const { currentProject: selectedProject } = useContext(selectedProjectContext);
  const [rowsExpands, setRowsExpand] = useState([]);
  const [updatingId, setUpdatingId] = useState(null); // Agora será usado nos inputs

  // ==========================================
  // MUTAÇÕES
  // ==========================================
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatusSummary"] });
    }
  });

  const dateMutation = useMutation({
    mutationFn: ({ id, date }) => updateCompletionDate(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatusSummary"] });
      queryClient.invalidateQueries({ queryKey: ["timesCascade"] }); 
    },
    onSettled: () => setUpdatingId(null)
  });

  // ==========================================
  // LÓGICA DE FILTRO (Memoizada)
  // ==========================================
  const groupedProjects = useMemo(() => {
    let raw = selectedProject?.id 
      ? materialsSummary.filter(p => p.project_id == selectedProject.id)
      : materialsSummary;

    return raw.map(proj => ({
      ...proj,
      equipments: proj.equipments?.filter(e => 
        e.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    })).filter(p => p.equipments.length > 0);
  }, [materialsSummary, selectedProject, searchTerm]);

  return (
    <div className="flex flex-col gap-8 w-full pb-4">
      {groupedProjects.map((group) => (
        <div key={group.project_id} className="flex flex-col gap-2">
          {!selectedProject?.id && (
            <h2 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-2">
              {group.project_name}
            </h2>
          )}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
            <table className="w-full project-equipments text-center">
              <thead>
                <tr className="text-left bg-[#DBEBFF]">
                  <th className="px-2 py-2 first:rounded-tl-lg">Equipamentos</th>
                  <th>Início Prev.</th>
                  <th>Início Real</th>
                  <th>Fim Prev.</th>
                  <th>Fim Real</th>
                  <th>Status</th>
                  <th>Resina</th>
                  <th>Roving</th>
                  <th>Tec. KG</th>
                  <th>Tec. CMD</th>
                  <th>Cat.</th>
                  <th>Manta</th>
                  <th>R. ISO</th>
                  <th>Valor</th>
                  <th className="last:rounded-tr-lg">H-H</th>
                </tr>
              </thead>
              <tbody>
                {group.equipments.map((equip) => {
                  const equip_totals = TotalEquipmentMaterial(equip);
                  const equipTime = times?.equipments?.[equip.equipment_id] || {};
                  const isExpanded = rowsExpands.includes(equip.equipment_id);
                  const equipStatus = statusSummary?.equipments?.find(e => e.equipment_id == equip.equipment_id);

                  return (
                    <Fragment key={equip.equipment_id}>
                      <tr 
                        className="bg-gray-200 hover:cursor-pointer border-b border-gray-300"
                        onClick={() => setRowsExpand(prev => isExpanded ? prev.filter(id => id !== equip.equipment_id) : [...prev, equip.equipment_id])}
                      >
                        <td className="font-bold text-left px-2">{equip.equipment_name}</td>
                        <td>{formatDateTime(equipTime.planned_start)}</td>
                        <td>{formatDateTime(equipTime.real_start)}</td>
                        <td>{formatDateTime(equipTime.planned_end)}</td>
                        <td>{formatDateTime(equipTime.real_end)}</td>
                        <td>{statusLabel(equipStatus?.status)}</td>
                        {[1, 2, 3, 4, 5, 6, 7].map(id => (
                          <td key={id}>{equip_totals[id]?.qtd?.toFixed(1) ?? 0}</td>
                        ))}
                        <td className="font-bold text-blue-600">{sumEquipmentValue(equip_totals)}</td>
                        <td>{(equipTime.total_hours / equipTime.qtd_employees || 0).toFixed(1)}</td>
                      </tr>

                      {isExpanded && equip.components.map((comp, cIdx) => {
                        const compTime = times?.components?.[comp.component_id] || {};
                        const compStatus = statusSummary?.components?.find(c => c.component_id === comp.component_id);
                        const isUpdating = updatingId === comp.component_id;

                        return (
                          <tr key={comp.component_id} className={cIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="pl-6 text-left text-gray-600 italic">{comp.component_name}</td>
                            <td className="text-gray-400">{formatDateTime(compTime.planned_start)}</td>
                            <td>{formatDateTime(compTime.real_start)}</td>
                            <td className="text-gray-400">{formatDateTime(compTime.planned_end)}</td>
                            <td>
                              <input
                                type="datetime-local"
                                className={`bg-transparent border ${isUpdating ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'} rounded text-[10px] w-full p-1`}
                                defaultValue={formatDateForInput(compTime.real_end)}
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    setUpdatingId(comp.component_id);
                                    dateMutation.mutate({ id: comp.component_id, date: e.target.value.replace("T", " ") + ":00" });
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <SelectMenu
                                options={[
                                  {id:"Pending", label:"Pendente"}, 
                                  {id:"Running", label:"Em Andamento"}, 
                                  {id:"Completed", label:"Concluído"},
                                  {id:"Delayed", label:"Atrasado"}
                                ]}
                                selectedOption={[compStatus?.status || "Pending"]}
                                setSelectedOption={(val) => statusMutation.mutate({ id: comp.component_id, status: val[0] })}
                              />
                            </td>
                            {[1, 2, 3, 4, 5, 6, 7].map(id => (
                              <td key={id} className="text-gray-500">{comp.materials[id]?.total_material_consumed ?? 0}</td>
                            ))}
                            <td className="text-gray-300">-</td>
                            <td>{(compTime.total_hours / compTime.qtd_employees || 0).toFixed(1)}</td>
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