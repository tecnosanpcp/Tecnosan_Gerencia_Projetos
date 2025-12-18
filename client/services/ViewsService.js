import axios from "axios";
const API_URL = "http://localhost:3001/views";

export const vwProjectConsumedMaterials = async (user_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/project-consumed-materials/${user_id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erro para contar quantidade de material consumido por projeto",
      error
    );
    return [];
  }
};

export const vwProjectDepartmentDelays = async () => {
  try {
    const response = await axios.get(API_URL + "/project-department-delays");
    return response.data ? response.data : [];
  } catch (error) {
    console.error(
      "Erro ao contar quantidades de dias atrasados por setor",
      error
    );
    return [];
  }
};

export const vwEquipmentRecipesMaterialSummary = async () => {
  try {
    const response = await axios.get(
      API_URL + "/equipment-recipes-materials-summary"
    );
    return response.data && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Erro no Service ao contar quantidade de materiais na receita do equipamento",
      error
    );
    return [];
  }
};

export const vwComponentRecipeMaterialsSummary = async () => {
  try {
    const response = await axios.get(API_URL + "/component-recipe-materials");
    return response.data && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Erro no Service ao contar quantidade de materiais na receita do componente",
      error
    );
    return [];
  }
};

export const vwBudgetsMaterialsSummary = async () => {
  try {
    const response = await axios.get(API_URL + "/budgets-materials-summary");
    return response.data && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Erro no Service ao contar quantidade de materiais na receita do componente",
      error
    );
    return [];
  }
};

export const vwMaterialDetailsComponentsRecipes = async (
  component_recipe_id
) => {
  try {
    if (!component_recipe_id) {
      console.error("Faltando dados");
      return null;
    }
    const response = await axios.get(
      `${API_URL}/material-details-componentes-recipes/${component_recipe_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Erro no front, ", error);
    return null;
  }
};

export const vwMaterialDetailsEquipmentRecipes = async (
  equipment_recipe_id
) => {
  try {
    if (!equipment_recipe_id) {
      console.error("Faltando dados");
      return null;
    }
    const response = await axios.get(
      `${API_URL}/material-details-equipment-recipes/${equipment_recipe_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Erro no front, ", error);
    return null;
  }
};

export const getTimesCascade = async () => {
  try {
    const response = await axios.get(`${API_URL}/get-times`);
    return response.data;
  } catch (error) {
    console.error("Erro no front, ", error);
    return null;
  }
};
