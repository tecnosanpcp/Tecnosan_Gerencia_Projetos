import { useState, useMemo, useContext, Fragment } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateStatus,
  updateCompletionDate,
} from "@services/ComponentsServices.js";

import { selectedProjectContext } from "@content/SeletedProject.jsx";

import { formatDateForInput } from "@utils/dateUtils.js";

import SelectMenu from "../../Ui/SelectMenu.jsx";

function TotalEquipmentMaterial(equipment) {
  if (!equipment?.components) return {};

  const totals = {};

  equipment.components.forEach((component) => {
    (component.materials || []).forEach((material) => {
      const id = material.material_id;

      if (!totals[id]) {
        totals[id] = {
          id,
          name: material.material_name,
          qtd: Number(material.total_material_consumed || 0),
          value: Number(material.total_value || 0),
        };
      } else {
        totals[id].qtd += Number(material.total_material_consumed || 0);

        totals[id].value += Number(material.total_value || 0);
      }
    });
  });

  return totals;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function sumEquipmentValue(equipmentTotals) {
  const values = Object.values(equipmentTotals || {});

  if (!values.length) {
    return "R$ 0,00";
  }

  return values
    .reduce((sum, material) => sum + Number(material.value || 0), 0)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
}

function statusLabel(status) {
  switch (status) {
    case "Pending":
      return "Pendente";

    case "Completed":
      return "Concluído";

    case "Running":
      return "Em Andamento";

    case "Delayed":
      return "Atrasado";

    case "Failed":
      return "Não Concluído";

    default:
      return "Sem Status";
  }
}

function statusClasses(status) {
  switch (status) {
    case "Completed":
      return "bg-[#E3F9F1] text-[#00875A]";

    case "Running":
      return "bg-[#E9F2FF] text-[#0052CC]";

    case "Delayed":
      return "bg-[#FFEBE6] text-[#DE350B]";

    case "Failed":
      return "bg-[#FFEBE6] text-[#DE350B]";

    case "Pending":
    default:
      return "bg-[#F4F5F7] text-[#5E6C84]";
  }
}

function HeaderCell({ children, className = "" }) {
  return (
    <th
      className={`
        border-b
        border-[#DFE1E6]
        bg-[#F4F5F7]
        px-1.5
        py-2
        text-left
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.02em]
        text-[#5E6C84]
        ${className}
      `}
    >
      {children}
    </th>
  );
}

export default function ProjectEquipmentsTable({
  times,
  searchTerm,
  materialsSummary,
  statusSummary,
}) {
  const queryClient = useQueryClient();

  const { currentProject: selectedProject } = useContext(
    selectedProjectContext,
  );

  const [rowsExpands, setRowsExpand] = useState([]);

  const [updatingId, setUpdatingId] = useState(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectStatusSummary"],
      });
    },
  });

  const dateMutation = useMutation({
    mutationFn: ({ id, date }) => updateCompletionDate(id, date),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectStatusSummary"],
      });

      queryClient.invalidateQueries({
        queryKey: ["timesCascade"],
      });

      queryClient.invalidateQueries({
        queryKey: ["projectTimesCascade"],
      });
    },

    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const groupedProjects = useMemo(() => {
    const source = selectedProject?.id
      ? materialsSummary.filter(
          (project) => project.project_id == selectedProject.id,
        )
      : materialsSummary;

    return source
      .map((project) => ({
        ...project,

        equipments:
          project.equipments?.filter((equipment) =>
            String(equipment.equipment_name || "")
              .toLowerCase()
              .includes(String(searchTerm || "").toLowerCase()),
          ) || [],
      }))
      .filter((project) => project.equipments.length > 0);
  }, [materialsSummary, selectedProject, searchTerm]);

  if (!groupedProjects.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center px-6 text-[12px] text-[#97A0AF]">
        Nenhum equipamento encontrado.
      </div>
    );
  }

  return (
    <div className="w-full">
      {groupedProjects.map((group) => (
        <div key={group.project_id} className="w-full">
          {!selectedProject?.id && (
            <div className="flex items-center border-t border-b border-[#B3D4FF] bg-[#E9F2FF] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 5.5C4 4.672 4.672 4 5.5 4h13C19.328 4 20 4.672 20 5.5v13c0 .828-.672 1.5-1.5 1.5h-13C4.672 20 4 19.328 4 18.5v-13Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 8h8M8 12h8M8 16h5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <h2
                  className="truncate text-[13px] font-semibold text-[#172B4D]"
                  title={group.project_name}
                >
                  {group.project_name}
                </h2>

                <span className="shrink-0 text-[10px] font-medium text-[#6B778C]">
                  Projeto
                </span>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[7%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr>
                  <HeaderCell className="sticky left-0 z-10 w-[15%]">
                    Equipamentos
                  </HeaderCell>

                  <HeaderCell>Início Prev.</HeaderCell>

                  <HeaderCell>Início Real</HeaderCell>

                  <HeaderCell>Fim Prev.</HeaderCell>

                  <HeaderCell>Fim Real</HeaderCell>

                  <HeaderCell>Status</HeaderCell>

                  <HeaderCell>Resina</HeaderCell>

                  <HeaderCell>Roving</HeaderCell>

                  <HeaderCell>Tec. KG</HeaderCell>

                  <HeaderCell>Tec. CMD</HeaderCell>

                  <HeaderCell>Cat.</HeaderCell>

                  <HeaderCell>Manta</HeaderCell>

                  <HeaderCell>R. ISO</HeaderCell>

                  <HeaderCell>Valor</HeaderCell>

                  <HeaderCell>H-H</HeaderCell>
                </tr>
              </thead>

              <tbody>
                {group.equipments.map((equipment, equipmentIndex) => {
                  const equipmentTotals = TotalEquipmentMaterial(equipment);

                  const equipmentTime =
                    times?.equipments?.[equipment.equipment_id] || {};

                  const isExpanded = rowsExpands.includes(
                    equipment.equipment_id,
                  );

                  const equipmentStatus = statusSummary?.equipments?.find(
                    (item) => item.equipment_id == equipment.equipment_id,
                  );

                  const materialIds = [1, 2, 3, 4, 5, 6, 7];

                  return (
                    <Fragment key={equipment.equipment_id}>
                      <tr
                        onClick={() =>
                          setRowsExpand((previous) =>
                            isExpanded
                              ? previous.filter(
                                  (id) => id !== equipment.equipment_id,
                                )
                              : [...previous, equipment.equipment_id],
                          )
                        }
                        className="
                            cursor-pointer
                            border-b
                            border-[#F4F5F7]
                            bg-white
                            transition-colors
                            hover:bg-[#F7F9FC]
                          "
                      >
                        <td
                          className="
    sticky
    left-0
    z-[5]
    border-r
    border-[#F4F5F7]
    bg-white
    px-1.5
    py-2
    text-left
  "
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`
                                  flex
                                  h-5
                                  w-5
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded
                                  text-[10px]
                                  font-bold
                                  ${
                                    isExpanded
                                      ? "bg-[#E9F2FF] text-[#0052CC]"
                                      : "bg-[#F4F5F7] text-[#5E6C84]"
                                  }
                                `}
                            >
                              {isExpanded ? "−" : "+"}
                            </span>

                            <span
                              className="
                              truncate text-xs font-semibold text-[#172B4D]
                            "
                            >
                              {equipment.equipment_name}
                            </span>
                          </div>
                        </td>

                        <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                          {formatDateTime(equipmentTime.planned_start)}
                        </td>

                        <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                          <span
                            className="block truncate"
                            title={formatDateTime(equipmentTime.real_start)}
                          >
                            {formatDateTime(equipmentTime.real_start)}
                          </span>
                        </td>

                        <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                          {formatDateTime(equipmentTime.planned_end)}
                        </td>

                        <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                          {formatDateTime(equipmentTime.real_end)}
                        </td>

                        <td className="px-1 py-1.5">
                          <span
                            className={`
                            inline-flex
                            max-w-full
                            items-center
                            justify-center
                            truncate
                            rounded-[3px]
                            px-1
                            py-0.5
                            text-[8px]
                            font-semibold
                            ${statusClasses(equipmentStatus?.status)}
                          `}
                          >
                            {statusLabel(equipmentStatus?.status)}
                          </span>
                        </td>

                        {materialIds.map((id) => (
                          <td
                            key={id}
                            className="px-1.5 py-2 text-[9px] text-[#5E6C84]"
                          >
                            {Number(equipmentTotals[id]?.qtd || 0).toFixed(1)}
                          </td>
                        ))}

                        <td className="px-1 py-1.5 text-[9px] font-semibold text-[#0052CC]">
                          <span
                            className="block truncate"
                            title={sumEquipmentValue(equipmentTotals)}
                          >
                            {sumEquipmentValue(equipmentTotals)}
                          </span>
                        </td>

                        <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                          {(
                            Number(equipmentTime.total_hours || 0) /
                              Number(equipmentTime.qtd_employees || 0) || 0
                          ).toFixed(1)}
                        </td>
                      </tr>

                      {isExpanded &&
                        (equipment.components || []).map(
                          (component, componentIndex) => {
                            const componentTime =
                              times?.components?.[component.component_id] || {};

                            const componentStatus =
                              statusSummary?.components?.find(
                                (item) =>
                                  item.component_id == component.component_id,
                              );

                            const isUpdating =
                              updatingId === component.component_id;

                            return (
                              <tr
                                key={component.component_id}
                                className={`
                                    border-b
                                    border-[#F4F5F7]
                                    ${
                                      componentIndex % 2 === 0
                                        ? "bg-[#FAFBFC]"
                                        : "bg-white"
                                    }
                                  `}
                              >
                                <td
                                  className="
                                      sticky
                                      left-0
                                      z-[5]
                                      border-r
                                      border-[#F4F5F7]
                                      bg-inherit
                                      px-3
                                      py-2
                                      pl-10
                                      text-left
                                    "
                                >
                                  <span className="text-[11px] text-[#5E6C84]">
                                    {component.component_name}
                                  </span>
                                </td>

                                <td className="px-1 py-1.5 text-[9px] text-[#5E6C84]">
                                  <span
                                    className="block truncate"
                                    title={formatDateTime(
                                      equipmentTime.planned_start,
                                    )}
                                  >
                                    {formatDateTime(
                                      equipmentTime.planned_start,
                                    )}
                                  </span>
                                </td>

                                <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                                  {formatDateTime(componentTime.real_start)}
                                </td>

                                <td className="px-1.5 py-2 text-[9px] text-[#5E6C84]">
                                  {formatDateTime(componentTime.planned_end)}
                                </td>

                                <td className="px-3 py-2">
                                  <input
                                    type="datetime-local"
                                    className={`
    h-[27px]
    w-full
    min-w-0
    rounded-[4px]
    border
    px-1
    text-[9px]
    outline-none
    ${
      isUpdating ? "border-[#FF991F] bg-[#FFF7E6]" : "border-[#DFE1E6] bg-white"
    }
    focus:border-[#0052CC]
  `}
                                  />
                                </td>

                                <td
                                  className="min-w-0 overflow-hidden px-1 py-2"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <div className="min-w-0 max-w-full overflow-hidden">
                                    <SelectMenu
                                      options={[
                                        { id: "Pending", label: "Pendente" },
                                        {
                                          id: "Running",
                                          label: "Em Andamento",
                                        },
                                        { id: "Completed", label: "Concluído" },
                                        { id: "Delayed", label: "Atrasado" },
                                      ]}
                                      selectedOption={[
                                        componentStatus?.status || "Pending",
                                      ]}
                                      setSelectedOption={(value) =>
                                        statusMutation.mutate({
                                          id: component.component_id,
                                          status: value[0],
                                        })
                                      }
                                    />
                                  </div>
                                </td>

                                {materialIds.map((id) => (
                                  <td
                                    key={id}
                                    className="min-w-0 overflow-hidden px-1 py-2 text-[10px] text-[#5E6C84]"
                                  >
                                    {Number(
                                      component.materials?.[id]
                                        ?.total_material_consumed || 0,
                                    ).toFixed(1)}
                                  </td>
                                ))}

                                <td className="px-3 py-2 text-[10px] text-[#97A0AF]">
                                  —
                                </td>

                                <td className="px-3 py-2 text-[10px] text-[#5E6C84]">
                                  {(
                                    Number(componentTime.total_hours || 0) /
                                      Number(
                                        componentTime.qtd_employees || 0,
                                      ) || 0
                                  ).toFixed(1)}
                                </td>
                              </tr>
                            );
                          },
                        )}
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
