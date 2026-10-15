import api from "./api.js";

export const readEquipRecipeCompRecipe = async () => {
  try {
    const response = await api.get("/equip-recipe-comp-recipe");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const readEquipRecipeCompRecipeById = async (equipment_recipe_id) => {
  try {
    if (!equipment_recipe_id) {
      console.error("ID não existe");
      return;
    }

    const response = await api.get(
      `/equip-recipe-comp-recipe/${equipment_recipe_id}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const createEquipRecipeCompRecipe = async (
  equipment_recipe_id,
  component_recipe_id,
  quantity_plan,
  offset_start_hours,
  duration_hours
) => {
  try {
    const response = await api.post("/equip-recipe-comp-recipe", {
      equipment_recipe_id,
      component_recipe_id,
      quantity_plan,
      offset_start_hours,
      duration_hours,
    });

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const updateEquipRecipeCompRecipe = async (
  equipment_recipe_id,
  component_recipe_id,
  quantity_plan
) => {
  try {
    const response = await api.put(
      `/equip-recipe-comp-recipe/${equipment_recipe_id}/${component_recipe_id}`,
      {
        quantity_plan,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

// Antes chamava-se updateDates e mandava planned_start_at/planned_end_at.
// A receita agora guarda tempo RELATIVO ao início do equipamento:
// offset_start_hours (quantas horas depois o componente começa) e
// duration_hours (quanto tempo dura). A data absoluta real de cada
// orçamento fica em budgets_components_schedule
// (ver budgetsComponentsSchedule.service.js).
export const updateRecipeSchedule = async (
  equipment_recipe_id,
  component_recipe_id,
  offset_start_hours,
  duration_hours
) => {
  try {
    if (
      !equipment_recipe_id ||
      !component_recipe_id ||
      (offset_start_hours === undefined && duration_hours === undefined)
    ) {
      throw new Error("Faltando dados");
    }

    const response = await api.put(
      `/equip-recipe-comp-recipe/schedule/${equipment_recipe_id}/${component_recipe_id}`,
      {
        offset_start_hours,
        duration_hours,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error na requisição:", error);
    throw error;
  }
};

export const deleteEquipRecipeCompRecipe = async (
  equipment_recipe_id,
  component_recipe_id
) => {
  try {
    const response = await api.delete(
      `/equip-recipe-comp-recipe/${equipment_recipe_id}/${component_recipe_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error na na requisição:", error);
    throw error;
  }
};
