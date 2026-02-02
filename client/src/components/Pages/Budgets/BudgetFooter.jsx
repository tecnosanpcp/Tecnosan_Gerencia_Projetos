import React, { useState } from "react";

import { VerifyAuth } from "@services/AuthService.js";
import { createProject } from "@services/ProjectService.js";
import { uploadStatusBudget } from "@services/BudgetService.js";

import AlertModal from "../../Ui/AlertModal";

import tick_double from "@imgs/tick-double.png";
import archive from "@imgs/archive.png";

export default function BudgetFooter({ currentBudget }) {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const handleSubmit = async () => {
  try {
    if (!currentBudget) {
      throw new Error("Escolha um projeto!");
    }

    const user = await VerifyAuth();

    // Organizando os parâmetros na ordem correta da função
    await createProject(
      user.user_id,             // 1. user_id
      currentBudget.name,       // 2. project_name
      "desc",                   // 3. project_desc
      currentBudget.local,      // 4. project_local
      currentBudget.start_date, // 5. start_date
      currentBudget.deadline,   // 6. completion_date (usando o deadline como previsão)
      currentBudget.deadline,   // 7. deadline
      "Pending",                // 8. status (corrigido o erro de digitação)
      currentBudget.id          // 9. budget_id
    );

    await uploadStatusBudget(currentBudget.id, "Aprovado");
    setShowApproveModal(false);
    
  } catch (error) {
    console.error("Erro ao processar aprovação:", error);
    alert("Erro ao criar projeto. Verifique os logs.");
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
            <img src={archive} className="h-5 w-5" />
            <span className="font-medium text-base">Arquivar Projeto</span>
          </button>

          <button
            className="flex items-center gap-2 bnt-add"
            onClick={() => setShowApproveModal(true)}
          >
            <img src={tick_double} className="h-5 w-5" />
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
          handleSubmit();
          //window.location.reload();
        }}
        isVisible={showApproveModal}
        setVisible={setShowApproveModal}
        style="pop-up"
      />
    </React.Fragment>
  );
}
