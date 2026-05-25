import React, { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import tick_double from "@imgs/tick-double.png";
import archive from "@imgs/archive.png";

import { updateProject } from "@services/ProjectService.js";
import { selectedProjectContext } from "@content/SeletedProject.jsx";

import AlertModal from "../../Ui/AlertModal";

export default function ProjectsFooter() {
  const queryClient = useQueryClient();
  const { currentProject } = useContext(selectedProjectContext);
  const [alertVisible, setAlertVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'archive' ou 'complete'

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
    setActionType('archive');
    setAlertVisible(true);
  };

  const completeProject = () => {
    if (!currentProject?.id) return alert("Selecione um projeto primeiro!");
    setActionType('complete');
    setAlertVisible(true);
  };

  const handleConfirm = () => {
    if (actionType === 'archive') {
      updateProjectMutation.mutate({ status: "Archived" });
    } else {
      const today = new Date().toISOString().split("T")[0];
      updateProjectMutation.mutate({ end_date: today, status: "completed" });
    }
    setAlertVisible(false);
  };

  if (!currentProject?.id) {
    return (
      <footer className="flex justify-center text-sm text-gray-400 italic p-2">
        Selecione um projeto para ver as opções de gerenciamento.
      </footer>
    );
  }

  return (
    <React.Fragment>
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

      <AlertModal
          isVisible={alertVisible}
          setVisible={setAlertVisible}
          title={actionType === 'archive' ? "Arquivar Projeto" : "Concluir Projeto"}
          body={`Tem certeza que deseja ${actionType === 'archive' ? "arquivar" : "concluir"} este projeto?`}
          neg_opt="Cancelar"
          pos_opt="Confirmar"
          func={handleConfirm}
          style={actionType === 'archive' ? "waring" : "pop-up"}
        />
    </React.Fragment>
  );
}