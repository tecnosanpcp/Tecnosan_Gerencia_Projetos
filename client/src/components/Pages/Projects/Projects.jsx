import NavBar from "../../Ui/NavBar";
import SidebarList from "../../Ui/SlideBarList";
import AddBudgetModal from "../Budgets/AddBudgetModal";
import ProjectEquipmentsTable from "./ProjectEquipmentsTable";
import { FaSearch } from "react-icons/fa";

import { selectedProjectContext } from "@content/SeletedProject.jsx";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";

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

      const project_data = await listProjects(user.user_id);
      if (project_data) setProjects(project_data);

      const hours_data = await getTimesCascade();
      setTimes(hours_data);
    }
    loadData();
  }, []);

  return (
    <>
      <div className="flex flex-col w-screen min-h-screen overflow-x-hidden gap-6">
        <NavBar select_index={1} />

        {/* Header Principal */}
        <div className="card justify-between">
          <h1 className="text-base font-medium">Projetos</h1>
          <button
            className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate("/budgets")}
          >
            Ir para Orçamento
          </button>
        </div>

        {/* Layout Principal */}
        <div className="flex flex-1 ml-8 gap-4 mb-8">
          {/* Sidebar */}
          <div className="w-1/12 min-w-[150px]">
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
          </div>

          {/* Conteúdo Principal */}
          <div className="flex flex-col flex-1 gap-4">
            {/* Header do Projeto */}
            <header className="card p-4">
              <div className="flex gap-8 w-full">
                <h1 className="text-xl font-bold">
                  {currentProject?.name || "Gastos Totais"}
                </h1>
                <p className="text-xl font-bold text-blue-500">
                  R$ 1.000.000,00
                </p>
              </div>

              <div className="flex gap-8 mt-2">
                <p>Resina: 250 Kg</p>
                <p>Roving: 300 Kg</p>
                <p>Tecido: 50 Kg</p>
                <p>CMD Tec: 20 cmd</p>
                <p>
                  Total de Horas:{" "}
                  {times?.projects?.[currentProject?.id]?.total_hours ?? 0}{" "}
                  Horas
                </p>
                <p>
                  Total de Homens:{" "}
                  {times?.projects?.[currentProject?.id]?.qtd_employees ?? 0} F
                </p>
                <p>
                  Total Horas-Homem:{" "}
                  {(times?.projects?.[currentProject?.id]?.qtd_employees ?? 0) *
                    (times?.projects?.[currentProject?.id]?.total_hours ??
                      0)}{" "}
                  F HH
                </p>
              </div>
            </header>

            {/* MAIN expansivo */}
            <main className="card m-0 p-4 gap-4 overflow-y-auto">
              {/* Barra de Pesquisa */}
              <div className="flex flex-row justify-between w-full">
                <form className="flex flex-row justify-between space-x-4 p-2 rounded-xl bg-white-gray h-fit">
                  <button>
                    <FaSearch />
                  </button>
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="bg-transparent"
                  />
                </form>

                {/* Botões de ações */}
                <div className="flex flex-row justify-center gap-4 h-fit">
                  <button className="bnt-add">+ Novo Equipamento</button>
                  <button className="bnt">Ir para Cronograma</button>
                  <button className="bnt">Ir para Acessórios</button>
                </div>
              </div>

              {/* Tabela */}
              <ProjectEquipmentsTable
                project_id={currentProject?.id}
                times={times ?? {}}
              />
            </main>

            {/* Footer */}
            <div className="flex justify-center">
              <div className="w-1/4 h-fit bg-white flex flex-row rounded shadow p-2 justify-around">
                <button className="flex items-center gap-2 bnt">
                  <img src="src/imgs/archive.png" className="h-5 w-5" />
                  <span className="font-medium text-base">
                    Arquivar Projeto
                  </span>
                </button>

                <button className="flex items-center gap-2 bnt-add">
                  <img src="src/imgs/tick-double.png" className="h-5 w-5" />
                  <span className="font-medium text-base">
                    Concluir Projeto
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Orçamento */}
      {isAddBudgetModalOpen && (
        <AddBudgetModal
          isOpen={isAddBudgetModalOpen}
          setOpen={setAddBudgetModalOpen}
        />
      )}
    </>
  );
}

export default Projects;
