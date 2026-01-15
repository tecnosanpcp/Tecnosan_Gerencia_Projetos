// Imports de componentes gerais
import SidebarList from "../../Ui/SlideBarList";
import DashboardLayout from "../../Ui/DashboardLayout";

// Import de componentes de especifícos a outro componente
import AddBudgetModal from "../Budgets/AddBudgetModal";

// Import de componentes especificos a esta página
import ProjectsHeader from "./ProjectsHeader";
import ProjectsMain from "./ProjectsMain";
import ProjectsFooter from "./ProjectsFooter";

// Import de funções
import { selectedProjectContext } from "@content/SeletedProject.jsx";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";

// Import de Services
import { listProjects } from "@services/ProjectService";
import { getTimesCascade } from "@services/ViewsService";
import { VerifyAuth } from "@services/AuthService";

function Projects() {
  const [projects, setProjects] = useState([]); // inicial vazio
  const [isAddBudgetModalOpen, setAddBudgetModalOpen] = useState(false);
  const { currentProject, setCurrentProject } = useContext(
    selectedProjectContext
  );
  const [times, setTimes] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const user = await VerifyAuth();
      const [project_data, hours_data] = await Promise.all([
        listProjects(user.user_id),
        await getTimesCascade(),
      ]);
      if (project_data) setProjects(project_data);
      if (hours_data) setTimes(hours_data);
    }
    loadData();
  }, []);

  useEffect(()=>console.log(times))

  return (
    <DashboardLayout
      title="Projetos"
      // O botão de navegação entra aqui
      actions={
        <button
          className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          onClick={() => navigate("/budgets")}
        >
          Ir para Orçamento
        </button>
      }
      // A Sidebar inteira entra aqui
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
      // O Header de métricas (resinas, horas) entra aqui
      header={<ProjectsHeader times={times} />}
    >
      {/* O conteúdo principal (que estava dentro de ProjectsMain e Footer) */}
      <div className="flex flex-col gap-4">
        <ProjectsMain times={times} />

        <ProjectsFooter />
      </div>

      {/* Seus Modais continuam aqui, fora do visual, mas dentro da lógica */}
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
