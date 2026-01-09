import { useEffect, useMemo, useState, useContext } from "react";
import {
  totalValuesProjects,
  totalMaterialsProjects,
} from "@services/ViewsSummary.js";
import { VerifyAuth } from "@services/AuthService.js";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

function renderMaterialSummary(
  project_materials,
  materials = [
    { id: 1, label: "Resina" },
    { id: 2, label: "Roving" },
    { id: 3, label: "Tecido (Kg)" },
    { id: 4, label: "Tecido (camadas)" },
    { id: 5, label: "Catalisador" },
    { id: 6, label: "Manta" },
    { id: 7, label: "Resina ISO" },
  ]
) {
  if (!project_materials) return <h1>Selecione um projeto</h1>;

  return materials.map((mat, index) => {
    const i_mat = project_materials.findIndex((m) => m.material_id == mat.id);

    return i_mat >= 0 ? (
      <p key={index}>
        {mat.label}: {project_materials[i_mat]?.total_value}
      </p>
    ) : (
      <p key={index}> {mat.label}: 0 </p>
    );
  });
}

export default function ProjectsHeader({ times }) {
  const [projectsMaterials, setProjectsMaterial] = useState([]);
  const [projectsValues, setProjectsValues] = useState([]);

  const { currentProject } = useContext(selectedProjectContext);

  useEffect(() => {
    const loadData = async () => {
      const user = await VerifyAuth();
      const times_data = await totalValuesProjects(user.user_id);
      setProjectsValues(times_data);

      const material_data = await totalMaterialsProjects(user.user_id);
      setProjectsMaterial(material_data);
    };
    loadData();
  }, []);

  const summary = useMemo(() => {
    if (!currentProject) {
      return;
    }
    const total_mat = projectsMaterials.filter(
      (p) => p.project_id == currentProject.id
    );

    const total_value = projectsValues.find(
      (p) => p.project_id == currentProject.id
    );

    const value = total_value?.total_value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return { materials: total_mat, value: value };
  }, [currentProject, projectsMaterials, projectsValues]);

  return (
    <header className="card p-4">
      <div className="flex gap-8 w-full">
        <h1 className="text-xl font-bold">
          {currentProject?.name || "Gastos Totais"}
        </h1>
        <p className="text-xl font-bold text-blue-500"> {summary?.value}</p>
      </div>

      <div className="flex gap-8 mt-2">
        {/* Materiais Summay */}
        {renderMaterialSummary(summary?.materials)}

        <p>
          Total de Horas:{" "}
          {times?.projects?.[currentProject?.id]?.total_hours ?? 0} Horas
        </p>
        <p>
          Total de Homens:{" "}
          {times?.projects?.[currentProject?.id]?.qtd_employees ?? 0} F
        </p>
        <p>
          Total Horas-Homem:{" "}
          {(times?.projects?.[currentProject?.id]?.qtd_employees ?? 0) *
            (times?.projects?.[currentProject?.id]?.total_hours ?? 0)}
          HH
        </p>
      </div>
    </header>
  );
}
