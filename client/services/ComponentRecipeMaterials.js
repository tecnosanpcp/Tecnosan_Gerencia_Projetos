import api from "./api.js"; 

export const readCompRecipeMat = async () => {
  try {
    const response = await api.get("/comp-recipe-mat");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error ao listar Materiais:", error);
  }
};

export const readCompRecipeMatByComp = async (component_recipe_id) => {
  try {
    if (!component_recipe_id) {
      console.error("Dados faltantes");
      return;
    }
    const response = await api.get(`/comp-recipe-mat/${component_recipe_id}`);
    return response.data;
  } catch (error) {
    console.error("Error ao listar Materiais:", error);
  }
};

export const createCompRecipeMat = async (
  component_recipe_id,
  material_id,
  quantity_plan
) => {
  try {
    const response = await api.post("/comp-recipe-mat", {
      component_recipe_id,
      material_id,
      quantity_plan,
    });

    return response.data;
  } catch (error) {
    console.error("Error criar Material:", error);
  }
};

export const updateCompRecipeMat = async (
  component_recipe_id,
  material_id,
  quantity_plan
) => {
  try {
    const response = await api.put(
      `/comp-recipe-mat/${component_recipe_id}/${material_id}`,
      {
        quantity_plan,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error criar Material:", error);
  }
};

export const deleteCompRecipeMat = async (component_recipe_id, material_id) => {
  try {
    const response = await api.delete(
      `/comp-recipe-mat/${component_recipe_id}/${material_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error criar Material:", error);
  }
};
