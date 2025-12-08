import React, { useEffect, useState } from "react";

import {
  vwProjectMaterialsSummary,
  vwTotalProjectsMaterials,
} from "@services/ViewsSummary.js";
import { VerifyAuth } from "@services/AuthService.js";

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
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function sumEquipmentValue(equip_totals) {
  return Object.values(equip_totals)
    .reduce((sum, mat) => {
      return sum + Number(mat.value);
    }, 0)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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

function renderComponentRow(components, compTimes) {
  return components.map((comp) => {
    const time = compTimes[comp?.component_id] || {};
    return (
      <tr key={comp.component_id}>
        <td colSpan={2}>{comp.component_name}</td>
        <td>{formatDateTime(time.start_date)}</td>
        <td>{formatDateTime(time.end_date)}</td>
        <td>Status</td>
        <td>{comp.materials[1]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[2]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[3]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[4]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[5]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[6]?.total_material_consumed ?? 0}</td>
        <td>{comp.materials[7]?.total_material_consumed ?? 0}</td>
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

function RenderTotals(totalProjectMaterials, projId) {
  const IDs = [1, 2, 3, 4, 5, 6, 7];
  const projectMaterials = totalProjectMaterials.filter(
    (proj) => proj.project_id == projId
  );
  return IDs.map((idCol) => {
    const materialEncontrado = projectMaterials.find(
      (mat) => mat.material_id == idCol
    );

    return (
      <th key={idCol}>
        {/* Se achou, mostra a qtd, senão mostra 0 */}
        {materialEncontrado ? materialEncontrado.total_quantity : 0}
      </th>
    );
  });
}

function ProjectEquipmentsTable({ project_id, times }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [projectsSummary, setProjectsSummary] = useState([]);
  const [rowsExpands, setRowsExpand] = useState([]);
  const [totalProjectMaterials, setTotalProjectMaterials] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const user = await VerifyAuth();

      const summary_data = await vwProjectMaterialsSummary(user.user_id);
      setProjectsSummary(summary_data);

      const total_data = await vwTotalProjectsMaterials(user.user_id);
      if (Array.isArray(total_data)) setTotalProjectMaterials(total_data);
    };
    loadData();
  }, []);

  useEffect(() => {
    projectsSummary.forEach((proj) => {
      if (proj.project_id === project_id) {
        setCurrentProject(proj);
        return;
      }
    });
  }, [project_id, projectsSummary]);

  // Debug
  useEffect(() => console.log(currentProject), [currentProject]);

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
        {currentProject?.equipments?.map((equip) => {
          const equip_totals = TotalEquipmentMaterial(equip);
          const total_value = sumEquipmentValue(equip_totals);
          console.log(total_value)
          const time = times.equipments[equip.equipment_id];
          const expanded = isExpanded(rowsExpands, equip.equipment_id);

          return (
            <React.Fragment key={equip.equipment_id}>
              <tr className="bg-white-gray" key={equip.equipment_id}>
                {/* Botão expand/collapse */}
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
                    />
                  </button>
                </th>

                {/* Informações */}
                <th>{equip.equipment_name}</th>
                <th>{formatDateTime(time.start_date)}</th>
                <th>{formatDateTime(time.end_date)}</th>
                <th>Status</th>

                {/* Colunas de materiais (dinâmico) */}
                {renderMaterialColumns(equip_totals)}

                {/* Total R$ */}
                <th>{total_value}</th>

                {/* Horas */}
                <th>{time.total_hours}</th>
              </tr>
              {expanded &&
                renderComponentRow(equip.components, times.components)}
            </React.Fragment>
          );
        })}
        <tr className="text-left bg-[#DBEBFF]">
          <th className="first:rounded-bl-lg" colSpan={2}>
            Totais
          </th>
          <th>
            {currentProject &&
              formatDateTime(
                times.projects[currentProject?.project_id].start_date
              )}
          </th>
          <th>
            {currentProject &&
              formatDateTime(
                times.projects[currentProject?.project_id].end_date
              )}
          </th>
          <th>Status</th>
          {RenderTotals(totalProjectMaterials, currentProject?.project_id)}

          <th>Valor</th>
          <th className="last:rounded-br-lg">Horas</th>
        </tr>
      </tbody>
    </table>
  );
}

export default ProjectEquipmentsTable;
