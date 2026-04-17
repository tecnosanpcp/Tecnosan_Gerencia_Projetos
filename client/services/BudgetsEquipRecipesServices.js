import api from "./api.js";

export async function createRelation(budget_id, equipment_id, quantity_plan) {
  try {
    if (!budget_id || !equipment_id || quantity_plan <= 0) {
      throw new Error("Faltando dados");
    }
    const response = await api.post("/budgets-equip-recipes/", {
      budget_id,
      equipment_id,
      quantity_plan,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    throw error;
  }
}

export async function deleteRelation(budget_id, equipment_id) {
  try {
    if (!budget_id || !equipment_id) throw new Error("IDs ausentes para exclusão");
    
    const response = await api.delete(`/budgets-equip-recipes/${budget_id}/${equipment_id}`);
    return response.data;
  } catch (error) {
    console.error("Erro no Service:", error);
    throw error;
  }
}