import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  vwProjectMaterialsSummary,
  vwSummaryStatus,
} from "@services/ViewsSummary.js";
import { VerifyAuth } from "@services/AuthService.js";

import { selectedProjectContext } from "@content/SeletedProject.jsx";

// --- Funções Auxiliares ---
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
  return Object.values(equip_totals)
    .reduce((sum, mat) => sum + Number(mat.value), 0)
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isExpanded(rowsExpands, id) {
  return rowsExpands.includes(id);
}

function renderMaterialColumns(
  equip_totals,
  materialIds = [1, 2, 3, 4, 5, 6, 7]
) {
  return materialIds.map((id) => (
    <th key={id}>{equip_totals[id]?.qtd ?? 0}</th>
  ));
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

function renderComponentRow(components, compTimes, statusComponents) {
  return components.map((comp, index) => {
    const bg_color = index % 2 == 0 ? "bg-gray-50" : "bg-gray-100";
    const time = compTimes[comp?.component_id] || {};
    const status = statusComponents?.find(
      (c) => c.component_id == comp.component_id
    )?.status;

    return (
      <tr key={comp.component_id} className={bg_color}>
        <td colSpan={2}>{comp.component_name}</td>
        <td>{formatDateTime(time.start_date)}</td>
        <td>{formatDateTime(time.end_date)}</td>
        <td>{statusLabel(status)}</td>
        {[1, 2, 3, 4, 5, 6, 7].map((id) => (
          <td key={id}>{comp.materials[id]?.total_material_consumed ?? 0}</td>
        ))}
        <td>
          {sumEquipmentValue(
            comp.materials.map((mat) => ({
              id: mat.material_id,
              value: mat.total_value,
            }))
          )}
        </td>
        <td>{time.total_hours}</td>
      </tr>
    );
  });
}

// --- Componente Principal ---

function ProjectEquipmentsTable({ times, searchTerm }) {
  const [projectsSummary, setProjectsSummary] = useState([]);
  const [rowsExpands, setRowsExpand] = useState([]);
  const [equipmentsFilter, setEquipmentsFilter] = useState([]);
  const [summaryStatus, setSummaryStatus] = useState({});

  const { currentProject: project } = useContext(selectedProjectContext);

  const currentProject = useMemo(() => {
    if (!project?.id) return null;
    return projectsSummary.find((proj) => proj.project_id == project.id);
  }, [projectsSummary, project?.id]);

  useEffect(() => {
    const loadData = async () => {
      const user = await VerifyAuth();
      const [summary_data, status_data] = await Promise.all([
        vwProjectMaterialsSummary(user.user_id),
        vwSummaryStatus(),
      ]);
      setProjectsSummary(summary_data);
      setSummaryStatus(status_data);
    };
    loadData();
  }, []);

  useEffect(()=>console.log(projectsSummary), [projectsSummary])

  useEffect(() => {
    if (!currentProject?.equipments) {
      setEquipmentsFilter([]);
      return;
    }

    if (searchTerm == "") {
      setEquipmentsFilter(currentProject.equipments);
    } else {
      setEquipmentsFilter(
        currentProject.equipments.filter((equip) =>
          equip.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [currentProject, searchTerm]);

  return (
    <table className="w-full project-equipments text-center">
      <thead>
        <tr className="text-left bg-[#DBEBFF]">
          <th className="first:rounded-tl-lg" colSpan={2}>
            Equipamentos
          </th>
          <th>Início</th>
          <th>Fim</th>
          <th>Status</th>
          <th>Resina</th>
          <th>Roving</th>
          <th>Tecido KG</th>
          <th>Tec. CMD</th>
          <th>Catalizador</th>
          <th>Manta</th>
          <th>Reina ISO</th>
          <th>Valor</th>
          <th className="last:rounded-tr-lg">Horas</th>
        </tr>
      </thead>
      <tbody>
        {equipmentsFilter?.map((equip) => {
          const equip_totals = TotalEquipmentMaterial(equip);
          const total_value = sumEquipmentValue(equip_totals);
          const time = times?.equipments?.[equip.equipment_id] || {};
          const expanded = isExpanded(rowsExpands, equip.equipment_id);
          const found = summaryStatus?.equipments?.find(
            (e) => e.equipment_id == equip.equipment_id
          );

          return (
            <React.Fragment key={equip.equipment_id}>
              <tr className="bg-gray-200" key={equip.equipment_id}>
                <th>
                  <button
                    onClick={() =>
                      setRowsExpand((prev) =>
                        expanded
                          ? prev.filter((id) => id !== equip.equipment_id)
                          : [...prev, equip.equipment_id]
                      )
                    }
                  >
                    <img
                      src={
                        expanded
                          ? "src/imgs/remove-square.png"
                          : "src/imgs/add-square.png"
                      }
                      className="w-5 h-5"
                      alt="Toggle"
                    />
                  </button>
                </th>
                <th>{equip.equipment_name}</th>
                <th>{formatDateTime(time.start_date)}</th>
                <th>{formatDateTime(time.end_date)}</th>
                <th>{statusLabel(found?.status)}</th>
                {renderMaterialColumns(equip_totals)}
                <th>{total_value}</th>
                <th>{time.total_hours}</th>
              </tr>
              {expanded &&
                renderComponentRow(
                  equip.components,
                  times?.components || {},
                  summaryStatus.components
                )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

export default ProjectEquipmentsTable;
