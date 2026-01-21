import api from "./api.js";

export const getComponentRecipe = async () => {
  try {
    const response = await api.get("/component-recipes");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Erro ao listar as receitas dos componentes:", error);
    return [];
  }
};

export const createComponentRecipe = async (
  recipe_name,
  qtd_employees,
  qtd_hours,
) => {
  try {
    const response = await api.post("/component-recipes", {
      recipe_name,
      qtd_employees,
      qtd_hours,
    });
    return response.data;
  } catch (error) {
    console.error("Error ao criar nova receita do componente" + error);
  }
};

export const deleteComponentRecipe = async (component_recipe_id) => {
  try {
    const response = await api.delete(
      `/component-recipes/${component_recipe_id}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error ao deletar a receita do componente de id " +
        component_recipe_id +
        " " +
        error,
    );
  }
};

export const updateComponentRecipe = async (
  component_recipe_id,
  recipe_name,
  qtd_employees,
  qtd_hours,
) => {
  try {
    const response = await api.put(
      `/component-recipes/${component_recipe_id}`,
      {
        recipe_name,
        qtd_employees,
        qtd_hours,
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error ao atuaçizar a receita do componente de id " +
        component_recipe_id +
        " " +
        error,
    );
  }
};
