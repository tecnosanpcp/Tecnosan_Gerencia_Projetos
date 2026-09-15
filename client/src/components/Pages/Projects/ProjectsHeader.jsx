import { useEffect, useMemo, useState, useContext } from "react";

import {
  totalValuesProjects,
  totalMaterialsProjects,
} from "@services/ViewsSummary.js";

import { VerifyAuth } from "@services/AuthService.js";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

const MATERIALS = [
  { id: 1, label: "Resina" },
  { id: 2, label: "Roving" },
  { id: 3, label: "Tecido (Kg)" },
  { id: 4, label: "Tecido (camadas)" },
  { id: 5, label: "Catalisador" },
  { id: 6, label: "Manta" },
  { id: 7, label: "Resina ISO" },
];

function formatNumber(value) {
  return Number(value || 0).toFixed(2);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function MaterialMetric({ label, value }) {
  return (
    <span className="whitespace-nowrap text-[11px] text-[#5E6C84]">
      <span className="font-medium text-[#172B4D]">{label}:</span>{" "}
      {value}
    </span>
  );
}

function getStatusStyle(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "concluído" ||
    normalized === "completo"
  ) {
    return "bg-[#E3F9F1] text-[#00875A]";
  }

  if (
    normalized === "pending" ||
    normalized === "pendente"
  ) {
    return "bg-[#FFF0B3] text-[#FF991F]";
  }

  if (
    normalized === "archived" ||
    normalized === "arquivado"
  ) {
    return "bg-[#F4F5F7] text-[#5E6C84]";
  }

  return "bg-[#E9F2FF] text-[#0052CC]";
}

export default function ProjectsHeader({ times }) {
  const [projectsMaterials, setProjectsMaterial] = useState([]);
  const [projectsValues, setProjectsValues] = useState([]);

  const { currentProject } = useContext(selectedProjectContext);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const user = await VerifyAuth();

        const [timesData, materialData] = await Promise.all([
          totalValuesProjects(user.user_id),
          totalMaterialsProjects(user.user_id),
        ]);

        if (!active) return;

        setProjectsValues(Array.isArray(timesData) ? timesData : []);
        setProjectsMaterial(
          Array.isArray(materialData) ? materialData : [],
        );
      } catch (error) {
        console.error(
          "Erro ao carregar resumo dos projetos:",
          error,
        );
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    if (!currentProject) {
      const totalValue = projectsValues.reduce(
        (acc, item) => acc + Number(item.total_value || 0),
        0,
      );

      const materialMap = new Map();

      projectsMaterials.forEach((item) => {
        const id = item.material_id;

        if (!materialMap.has(id)) {
          materialMap.set(id, {
            material_id: id,
            total_value: 0,
          });
        }

        const current = materialMap.get(id);

        current.total_value += Number(
          item.total_value || 0,
        );
      });

      return {
        name: "Visão Geral (Todos os Projetos)",
        materials: Array.from(materialMap.values()),
        value: totalValue,
        isGlobal: true,
      };
    }

    const projectMaterials = projectsMaterials.filter(
      (item) =>
        item.project_id == currentProject.id,
    );

    const projectValue = projectsValues.find(
      (item) =>
        item.project_id == currentProject.id,
    );

    return {
      name:
        currentProject.name ||
        currentProject.project_name ||
        "Projeto",
      materials: projectMaterials,
      value: Number(projectValue?.total_value || 0),
      isGlobal: false,
    };
  }, [
    currentProject,
    projectsMaterials,
    projectsValues,
  ]);

  const hoursMetrics = useMemo(() => {
    if (!times?.projects) {
      return {
        total_hours: 0,
        qtd_employees: 0,
        total_hh: 0,
      };
    }

    if (!currentProject) {
      const allProjects = Object.values(times.projects);

      const totalHours = allProjects.reduce(
        (acc, item) =>
          acc + Number(item.total_hours || 0),
        0,
      );

      const employees = allProjects.reduce(
        (acc, item) =>
          acc + Number(item.qtd_employees || 0),
        0,
      );

      const totalHH = allProjects.reduce(
        (acc, item) =>
          acc +
          Number(item.qtd_employees || 0) *
            Number(item.total_hours || 0),
        0,
      );

      return {
        total_hours: totalHours,
        qtd_employees: employees,
        total_hh: totalHH,
      };
    }

    const projectData =
      times.projects[currentProject.id] || {};

    return {
      total_hours: Number(
        projectData.total_hours || 0,
      ),
      qtd_employees: Number(
        projectData.qtd_employees || 0,
      ),
      total_hh:
        Number(projectData.qtd_employees || 0) *
        Number(projectData.total_hours || 0),
    };
  }, [times, currentProject]);

  return (
    <section
      className="
        rounded-[4px]
        border
        border-[#DFE1E6]
        bg-white
        px-5
        py-4
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
      "
    >
      {/* TÍTULO */}
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[16px] font-bold text-[#172B4D]">
            {summary.name}
          </h2>

          {!summary.isGlobal &&
            currentProject?.status && (
              <span
                className={`
                  rounded-[3px]
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  ${getStatusStyle(
                    currentProject.status,
                  )}
                `}
              >
                {currentProject.status}
              </span>
            )}
        </div>

        <span className="shrink-0 text-[18px] font-bold text-[#0052CC]">
          {formatCurrency(summary.value)}
        </span>
      </div>

      {/* MÉTRICAS */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {MATERIALS.map((material) => {
          const data = summary.materials.find(
            (item) =>
              item.material_id == material.id,
          );

          return (
            <MaterialMetric
              key={material.id}
              label={material.label}
              value={formatNumber(
                data?.total_value,
              )}
            />
          );
        })}

        <MaterialMetric
          label="Total de Horas"
          value={`${hoursMetrics.total_hours.toFixed(
            1,
          )} Horas`}
        />

        <MaterialMetric
          label="Total de Homens"
          value={`${hoursMetrics.qtd_employees} F`}
        />

        <MaterialMetric
          label="Total Horas-Homem"
          value={`${hoursMetrics.total_hh.toFixed(
            1,
          )} HH`}
        />
      </div>
    </section>
  );
}