import { useEffect, useState } from "react";
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
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isAddBudgetModalOpen, setAddBudgetModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function LoadData() {
      const user = await VerifyAuth();

      const data = await listBudgets(user.user_id);
      if (data) setBudgets(data);
    }
    LoadData();
  }, []);

  return (
    <DashboardLayout
      title="Orçamento"
      actions={
        <button
          className="px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          onClick={() => navigate("/projects")}
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
          }))}
          selectedItem={selectedBudget}
          onSelectItem={setSelectedBudget}
          onAdd={() => setAddBudgetModalOpen(true)}
          addLabel="+ Novo Orçamento"
          titleAll="Todos os Orçamentos"
          filterOptions={[
            { value: "Running", label: "Executando" },
            { value: "Completed", label: "Concluído" },
          ]}
        />
      }
      header={<BudgetHeader currentBudget={selectedBudget}/>}
    >
      <div className="flex flex-col gap-4">
        <BudgetsMain currentBudget={selectedBudget} />
        <BudgetFooter currentBudget={selectedBudget}/>
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
