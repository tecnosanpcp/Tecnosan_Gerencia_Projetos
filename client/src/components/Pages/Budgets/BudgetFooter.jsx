import React, { useState } from "react";

import { VerifyAuth } from "@services/AuthService.js";
import { createProject } from "@services/ProjectService.js";
// import { createEquipment } from "@services/EquipmentService.js"
import { uploadStatusBudget } from "@services/BudgetService.js";

import AlertModal from "../../Ui/AlertModal";

import ArquiveImg from "../../../imgs/archive.png"
import DobleTick from "../../../imgs/tick-double.png"

export default function BudgetFooter({ currentBudget }) {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const handleSubmit = async (project_name, project_local, budget_id) => {
    try {
      const user = await VerifyAuth();
      
      const projectData =  await createProject(
        user.user_id,
        project_name,
        "desc",
        project_local,
        "09-01-2026",
        "09-01-2026",
        "09-01-2026",
        "Peding",
        budget_id
      );

      console.log(projectData)

      await uploadStatusBudget(budget_id, "Aprovado");
      setShowApproveModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmArchive = async (budget_id) => {
    try {
      if (!budget_id) {
        throw new Error("Faltando dados");
      }
      await uploadStatusBudget(budget_id, "Arquivado");
      setShowArchiveModal(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao arquivar orçamento.");
    }
  };

  return (
    <React.Fragment>
      <footer className="flex justify-center" key={1}>
        <div className="w-1/4 h-fit bg-white flex flex-row rounded shadow p-2 justify-around">
          <button
            className="flex items-center gap-2 bnt"
            onClick={() => setShowArchiveModal(true)}
          >
            <img src={ArquiveImg} className="h-5 w-5" />
            <span className="font-medium text-base">Arquivar Projeto</span>
          </button>

          <button
            className="flex items-center gap-2 bnt-add"
            onClick={() => setShowApproveModal(true)}
          >
            <img src={DobleTick} className="h-5 w-5" />
            <span className="font-medium text-base">Aprovar Orçamento</span>
          </button>
        </div>
      </footer>

      <AlertModal
        key={2}
        title="Atenção!"
        body="Tem certeza que deseja arquivar este orçamento? O projeto não poderá ser criado a partir dele se estiver arquivado."
        neg_opt="Cancelar"
        pos_opt="Sim, Arquivar"
        func={() => handleConfirmArchive(currentBudget.id)}
        isVisible={showArchiveModal}
        setVisible={setShowArchiveModal}
        style="waring"
      />

      <AlertModal
        title="Aprovar Projeto"
        body="Deseja aprovar este projeto? Isso mudará o status para 'Em Andamento' e liberará o cadastro de componentes."
        neg_opt="Cancelar"
        pos_opt="Sim, Aprovar"
        func={(e) => {
          e.preventDefault();
          handleSubmit(
            currentBudget?.name,
            currentBudget?.local,
            currentBudget?.id
          );
          window.location.reload();
        }}
        isVisible={showApproveModal}
        setVisible={setShowApproveModal}
        style="pop-up"
      />
    </React.Fragment>
  );
}
