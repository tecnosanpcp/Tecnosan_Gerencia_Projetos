import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

// Imports de componentes gerais
import SidebarList from "../../Ui/SlideBarList";
import DashboardLayout from "../../Ui/DashboardLayout";

// Import de componentes de específicos a outro componente
import AddBudgetModal from "../Budgets/AddBudgetModal";

// Import de componentes especificos a esta página
import ProjectsHeader from "./ProjectsHeader";
import ProjectsMain from "./ProjectsMain";
import ProjectsFooter from "./ProjectsFooter";

// Import de funções
import { selectedProjectContext } from "@content/SeletedProject.jsx";

// Import de Services
import { listProjects } from "@services/ProjectService";
import { getTimesCascade } from "@services/ViewsService";
import { VerifyAuth } from "@services/AuthService";

function Projects() {
  const [isAddBudgetModalOpen, setAddBudgetModalOpen] = useState(false);
  const { currentProject, setCurrentProject } = useContext(selectedProjectContext);
  const navigate = useNavigate();

  // ==========================================
  // QUERIES CENTRALIZADAS NO PAI
  // ==========================================

  // Query para buscar as horas (Times)
  const timesQuery = useQuery({
    queryKey: ["projectTimesCascade"],
    queryFn: getTimesCascade,
  });

  // Query para buscar os Projetos (depende da autenticação)
  const projectsQuery = useQuery({
    queryKey: ["projectsList"],
    queryFn: async () => {
      const user = await VerifyAuth();
      return listProjects(user.user_id);
    },
  });

  // Facilita o acesso aos dados ou define um fallback vazio
  const projects = projectsQuery.data || [];
  const times = timesQuery.data || {};

  return (
    <DashboardLayout
      title="Projetos"
      actions={
        <button
          className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          onClick={() => navigate("/budgets")}
        >
          Ir para Orçamento
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
          onAdd={() => setAddBudgetModalOpen(true)}
          addLabel="+ Novo Projeto"
          titleAll="Todos os Projetos"
          filterOptions={[
            { value: "Running", label: "Executando" },
            { value: "Pending", label: "Pendente" },
          ]}
        />
      }
      header={
        projectsQuery.isLoading || timesQuery.isLoading ? (
          <div className="p-4 text-sm text-gray-500">Carregando métricas...</div>
        ) : (
          <ProjectsHeader times={times} />
        )
      }
    >
      <div className="flex flex-col gap-4">
        {/* Passamos o estado de carregamento global para o Main, se necessário */}
        <ProjectsMain times={times} />

        <ProjectsFooter />
      </div>

      {isAddBudgetModalOpen && (
        <AddBudgetModal
          isOpen={isAddBudgetModalOpen}
          setOpen={setAddBudgetModalOpen}
        />
      )}
    </DashboardLayout>
  );
}

export default Projects;