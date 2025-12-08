import axios from "axios";
const API_URL = "http://localhost:3001/vwSummary";

export const vwProjectMaterialsSummary = async (user_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/projects/${user_id}`
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

export const vwEquipmentMaterialsSummary = async () => {
  try {
    const response = await axios.get(API_URL + "/department");
    return response.data ? response.data : [];
  } catch (error) {
    console.error(
      "Erro ao contar quantidades de dias atrasados por setor",
      error
    );
    return [];
  }
};

export const vwComponentRecipeMaterials = async () => {
  try {
    const response = await axios.get(
      API_URL + "/components"
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

export const vwTotalProjectsMaterials = async (user_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/total/projects/${user_id}`
    );
    return response.data && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Erro no Service",
      error
    );
    return [];
  }
};
