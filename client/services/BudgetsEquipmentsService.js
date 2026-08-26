import api from "./api.js";

export const listBudgetEquipments = async (budget_id) => {
  try {
    const url = budget_id
      ? `/budgets-equipments/budget/${budget_id}`
      : "/budgets-equipments";
    const response = await api.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const readBudgetEquipmentById = async (budget_equipment_id) => {
  try {
    if (!budget_equipment_id) {
      console.error("ID não existe");
      return;
    }

    const response = await api.get(`/budgets-equipments/${budget_equipment_id}`);
    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const createBudgetEquipment = async (
  budget_id,
  equipment_recipe_id,
  equipment_name
) => {
  try {
    if (!budget_id || !equipment_recipe_id) {
      throw new Error("Faltando dados");
    }

    const response = await api.post("/budgets-equipments", {
      budget_id,
      equipment_recipe_id,
      equipment_name,
    });

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const updateBudgetEquipment = async (budget_equipment_id, equipment_name) => {
  try {
    if (!budget_equipment_id || !equipment_name) {
      throw new Error("Faltando dados");
    }

    const response = await api.put(`/budgets-equipments/${budget_equipment_id}`, {
      equipment_name,
    });

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const deleteBudgetEquipment = async (budget_equipment_id) => {
  try {
    const response = await api.delete(`/budgets-equipments/${budget_equipment_id}`);
    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};
