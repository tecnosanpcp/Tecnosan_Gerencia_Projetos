import React, { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VerifyAuth } from "@services/AuthService.js";
import { createProject } from "@services/ProjectService.js";
import { uploadStatusBudget } from "@services/BudgetService.js";

import AlertModal from "../../Ui/AlertModal";

import tick_double from "@imgs/tick-double.png";
import archive from "@imgs/archive.png";

export default function BudgetFooter({ currentBudget }) {
  const queryClient = useQueryClient();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Mutação para Aprovar e Criar Projeto
  const approveMutation = useMutation({
    mutationFn: async () => {
      const user = await VerifyAuth();
      // Cria o projeto
      await createProject(
        user.user_id,
        currentBudget.name,
        "desc",
        currentBudget.local,
        currentBudget.start_date,
        currentBudget.deadline,
        currentBudget.deadline,
        "Pending",
        currentBudget.id
      );
      // Atualiza o status do orçamento
      return await uploadStatusBudget(currentBudget.id, "Aprovado");
    },
    onSuccess: () => {
      // Atualiza os dados de orçamentos e projetos no cache
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowApproveModal(false);
    }
  });

  // Mutação para Arquivar
  const archiveMutation = useMutation({
    mutationFn: (id) => uploadStatusBudget(id, "Arquivado"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowArchiveModal(false);
    }
  });

  // Substitui o teu handleSubmit antigo
  const handleApprove = () => approveMutation.mutate();
  const handleArchive = () => archiveMutation.mutate(currentBudget.id);

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
        func={handleArchive}
        isVisible={showArchiveModal}
        setVisible={setShowArchiveModal}
        style="waring"
      />

      <AlertModal
        title="Aprovar Projeto"
        body="Deseja aprovar este projeto? Isso mudará o status para 'Em Andamento' e liberará o cadastro de componentes."
        neg_opt="Cancelar"
        pos_opt="Sim, Aprovar"
        func={handleApprove}
        isVisible={showApproveModal}
        setVisible={setShowApproveModal}
        style="pop-up"
      />
    </React.Fragment>
  );
}
