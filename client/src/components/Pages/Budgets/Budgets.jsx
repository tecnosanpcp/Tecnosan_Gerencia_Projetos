  import { useState } from "react";
  import { useQuery } from "@tanstack/react-query";
  import { useNavigate } from "react-router";

  // Services
  import { listBudgets } from "@services/BudgetService.js";
  import { VerifyAuth } from "@services/AuthService.js";

  // Components
  import DashboardLayout from "../../Ui/DashboardLayout";
  import SidebarList from "../../Ui/SlideBarList";
  import AddBudgetModal from "./AddBudgetModal";
  import BudgetHeader from "./BudgetHeader";
  import BudgetsMain from "./BudgetsMain";
  import BudgetFooter from "./BudgetFooter";

  function Budgets() {
    const { data: budgets, isLoading, isError, error } = useQuery({
      queryKey: ["budgets"],
      queryFn: async () => {
        const user = await VerifyAuth();
        return await listBudgets(user.user_id);
      }
    });
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [isAddBudgetModalOpen, setAddBudgetModalOpen] = useState(false);
    const navigate = useNavigate();

    if (isLoading) {
      return <div>Carregando orçamentos...</div>;
    }

    if (isError) {
      return <div>Erro ao carregar dados: {error.message}</div>;
    }

    return (
      <DashboardLayout
        title="Orçamento"
        actions={
          <button
          type="button"
          onClick={() => navigate("/projects")}
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
          Ir para Projetos
        </button>
        }
        sidebar={
          <SidebarList
            items={budgets.map((bud) => ({
              id: bud.budget_id,
              name: bud.budget_name,
              local: bud.budget_local,
              status: bud.status,
              start_date: bud.start_date,
              deadline: bud.deadline
            }))}
            selectedItem={selectedBudget}
            onSelectItem={setSelectedBudget}
            onAdd={() => setAddBudgetModalOpen(true)}
            addLabel="Novo Orçamento"
            titleAll="Todos os Orçamentos"
            defaultFilter="Em Planejamento"
            filterOptions={[
              { value: "Em Planejamento", label: "Em Planejamento" },
              { value: "Aprovado", label: "Aprovado" },
              { value: "Arquivado", label: "Arquivado" },
            ]}
          />
        }
        header={<BudgetHeader currentBudget={selectedBudget} />}
      >
        <div className="flex flex-col gap-4">
          {/* Passamos a lista completa de budgets aqui */}
          <BudgetsMain currentBudget={selectedBudget} allBudgets={budgets} />
          
          {/* Footer só aparece se tiver um orçamento específico selecionado */}
          {selectedBudget && <BudgetFooter currentBudget={selectedBudget} />}
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

  export default Budgets;