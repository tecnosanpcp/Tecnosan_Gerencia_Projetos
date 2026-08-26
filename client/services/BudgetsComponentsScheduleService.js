import api from "./api.js";

export const listBudgetComponentSchedule = async (budget_equipment_id) => {
  try {
    const url = budget_equipment_id
      ? `/budgets-components-schedule/equipment/${budget_equipment_id}`
      : "/budgets-components-schedule";
    const response = await api.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const createBudgetComponentSchedule = async (
  budget_equipment_id,
  component_recipe_id,
  planned_start_at,
  planned_end_at
) => {
  try {
    if (
      !budget_equipment_id ||
      !component_recipe_id ||
      !planned_start_at ||
      !planned_end_at
    ) {
      throw new Error("Faltando dados");
    }

    const response = await api.post("/budgets-components-schedule", {
      budget_equipment_id,
      component_recipe_id,
      planned_start_at,
      planned_end_at,
    });

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const updateBudgetComponentSchedule = async (
  id,
  planned_start_at,
  planned_end_at
) => {
  try {
    if (!id || (!planned_start_at && !planned_end_at)) {
      throw new Error("Faltando dados");
    }

    const response = await api.put(`/budgets-components-schedule/${id}`, {
      planned_start_at,
      planned_end_at,
    });

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const deleteBudgetComponentSchedule = async (id) => {
  try {
    const response = await api.delete(`/budgets-components-schedule/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

// Cria ou atualiza a data de um componente dentro de um equipamento de
// orçamento (não precisa saber o "id" da linha do cronograma, só
// budget_equipment_id + component_recipe_id). Pensado pra telas que
// salvam a cada "onBlur" de um input de data.
export const upsertBudgetComponentSchedule = async (
  budget_equipment_id,
  component_recipe_id,
  planned_start_at,
  planned_end_at
) => {
  try {
    if (
      !budget_equipment_id ||
      !component_recipe_id ||
      (!planned_start_at && !planned_end_at)
    ) {
      throw new Error("Faltando dados");
    }

    const response = await api.put(
      `/budgets-components-schedule/${budget_equipment_id}/${component_recipe_id}`,
      { planned_start_at, planned_end_at }
    );

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

// Gera o cronograma inteiro de um equipamento de orçamento de uma vez,
// aplicando offset_start_hours/duration_hours da receita em cima de uma
// data-âncora (ex.: start_date do equipamento).
export const generateScheduleFromRecipe = async (
  budget_equipment_id,
  anchor_start_at
) => {
  try {
    if (!budget_equipment_id || !anchor_start_at) {
      throw new Error("Faltando dados");
    }

    const response = await api.post(
      `/budgets-components-schedule/equipment/${budget_equipment_id}/generate`,
      { anchor_start_at }
    );

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};