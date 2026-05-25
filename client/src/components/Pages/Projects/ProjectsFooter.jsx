import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import tick_double from "@imgs/tick-double.png";
import archive from "@imgs/archive.png";

import { updateProject } from "@services/ProjectService.js";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

export default function ProjectsFooter() {
  const queryClient = useQueryClient();
  const { currentProject } = useContext(selectedProjectContext);

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedFields) => {
      if (!currentProject?.id) return;

      return await updateProject(
        currentProject.id, 
        currentProject.name,
        currentProject.desc,
        currentProject.project_local || "", 
        currentProject.start_date,
        updatedFields.end_date ?? currentProject.completion_date,
        currentProject.deadline,
        updatedFields.status ?? currentProject.status
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectsList"] });
      queryClient.invalidateQueries({ queryKey: ["projectStatusSummary"] });
    },
  });

  const archiveProject = () => {
    if (!currentProject?.id) return alert("Selecione um projeto primeiro!");
    updateProjectMutation.mutate({ status: "Archived" });
  };

  const completeProject = () => {
    if (!currentProject?.id) return alert("Selecione um projeto primeiro!");

    const today = new Date().toISOString().split("T")[0];
    updateProjectMutation.mutate({ end_date: today, status: "completed" });
  };

  if (!currentProject?.id) {
    return (
      <footer className="flex justify-center text-sm text-gray-400 italic p-2">
        Selecione um projeto para ver as opções de gerenciamento.
      </footer>
    );
  }

  return (
    <footer className="flex justify-center">
      <div className="w-1/4 h-fit bg-white flex flex-row rounded shadow p-2 justify-around min-w-[320px]">
        <button 
          className="flex items-center gap-2 bnt disabled:opacity-50"
          onClick={archiveProject}
          disabled={updateProjectMutation.isPending}
        >
          <img src={archive} className="h-5 w-5" alt="Arquivar" />
          <span className="font-medium text-base">
            {updateProjectMutation.isPending ? "Salvando..." : "Arquivar Projeto"}
          </span>
        </button>

        <button 
          className="flex items-center gap-2 bnt-add disabled:opacity-50"
          onClick={completeProject}
          disabled={updateProjectMutation.isPending}
        >
          <img src={tick_double} className="h-5 w-5" alt="Concluir" />
          <span className="font-medium text-base">
            {updateProjectMutation.isPending ? "Salvando..." : "Concluir Projeto"}
          </span>
        </button>
      </div>
    </footer>
  );
}