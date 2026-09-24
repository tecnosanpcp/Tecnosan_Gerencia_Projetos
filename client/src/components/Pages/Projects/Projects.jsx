import { useContext } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import SidebarList from "../../Ui/SlideBarList";
import DashboardLayout from "../../Ui/DashboardLayout";

import ProjectsHeader from "./ProjectsHeader";
import ProjectsMain from "./ProjectsMain";
import ProjectsFooter from "./ProjectsFooter";

import { selectedProjectContext } from "@content/SeletedProject.jsx";

import { listProjects } from "@services/ProjectService";
import { getTimesCascade } from "@services/ViewsService";
import { VerifyAuth } from "@services/AuthService";

function Projects() {
  const { currentProject, setCurrentProject } = useContext(
    selectedProjectContext,
  );

  const navigate = useNavigate();

  const timesQuery = useQuery({
    queryKey: ["projectTimesCascade"],
    queryFn: getTimesCascade,
  });

  const projectsQuery = useQuery({
    queryKey: ["projectsList"],
    queryFn: async () => {
      const user = await VerifyAuth();
      return listProjects(user.user_id);
    },
  });

  const projects = projectsQuery.data || [];
  const times = timesQuery.data || {};

  const handleNewProject = () => {
    navigate("/budgets");
  };

  return (
    <DashboardLayout
      title="Projetos"
      actions={
        <button
          type="button"
          onClick={() => navigate("/budgets")}
          className="
        inline-flex
        items-center
        justify-center
        rounded-[4px]
        border border-[#DFE1E6]
        bg-white
        px-3 py-1.5
        text-[12px]
        font-semibold
        text-[#172B4D]
        transition-colors
        hover:bg-[#F4F5F7]
      "
        >
          Ir para Orçamentos
        </button>
      }
      sidebar={
        <SidebarList
          items={projects.map((project) => ({
            id: project.project_id,
            name: project.project_name,
            desc: project.project_desc,
            status: project.status,
            start_date: project.start_date,
            completion_date: project.completion_date,
            deadline: project.deadline,
          }))}
          selectedItem={currentProject}
          onSelectItem={setCurrentProject}
          onAdd={handleNewProject}
          addLabel="Novo Projeto"
          titleAll="Todos os Projetos"
          filterOptions={[
            {
              value: "Running",
              label: "Executando",
            },
            {
              value: "Pending",
              label: "Pendente",
            },
            {
              value: "Archived",
              label: "Arquivado",
            },
            {
              value: "completed",
              label: "Completo",
            },
          ]}
          defaultFilter="Running"
        />
      }
      header={
        projectsQuery.isLoading || timesQuery.isLoading ? (
          <div className="p-4 text-sm text-[#6B778C]">
            Carregando métricas...
          </div>
        ) : (
          <ProjectsHeader times={times} />
        )
      }
    >
      <div className="flex flex-col gap-4">
        <ProjectsMain times={times} />
        <ProjectsFooter />
      </div>
    </DashboardLayout>
  );
}

export default Projects;
