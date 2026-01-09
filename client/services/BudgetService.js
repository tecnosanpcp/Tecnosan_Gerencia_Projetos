import api from "./api.js";

export async function createBudget(user_id, budget_name, budget_local) {
  try {
    const response = await api.post("/budgets", {
      user_id,
      budget_name,
      budget_local,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    throw error;
  }
}

export async function listBudgets(user_id) {
  try {
    if (!user_id) {
      throw new Error("Faltando dados");
    }
    const response = await api.get(`/budgets/${user_id}`);
    return Array.isArray(response.data) ? response.data : null;
  } catch (error) {
    console.error("Error ao listar orçamentos", error);
    throw error;
  }
}

export async function uploadStatusBudget(budget_id, status) {
  try {
    if (
      !budget_id ||
      !(
        status === "Em Planejamento" ||
        status === "Aprovado" ||
        status === "Arquivado"
      )
    ) {
      throw new Error("Faltando dados");
    }
    const response = await api.put(`/budgets/status/${budget_id}`, { status });
    return Array.isArray(response.data) ? response.data : null;
  } catch (error) {
    console.error("Error ao listar orçamentos", error);
    throw error;
  }
}
