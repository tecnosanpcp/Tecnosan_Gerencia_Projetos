import axios from "axios";
const API_URL = "http://localhost:3001/vwSummary";

export const vwProjectMaterialsSummary = async (user_id) => {
  try {
    const response = await axios.get(`${API_URL}/projects/${user_id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Erro para contar quantidade de material consumido por projeto",
      error
    );
    return [];
  }
};

export const totalMaterialsProjects = async (user_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/projects-materials/${user_id}`
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

export const totalValuesProjects = async (user_id) => {
  try {
    const response = await axios.get(`${API_URL}/projects-values/${user_id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Erro para contar quantidade de material consumido por projeto",
      error
    );
    return [];
  }
};

export const vwEquipmentMaterialsSummary = async (user_id) => {
  try {
    if (!user_id) {
      console.error("Usuário inválido");
      return;
    }
    const response = await axios.get(`${API_URL}/equipments/${user_id}`);
    return response.data ? response.data : [];
  } catch (error) {
    console.error(
      "Erro ao contar quantidades de dias atrasados por setor",
      error
    );
    return [];
  }
};

export const vwComponentRecipeMaterials = async (user_id) => {
  try {
    if (!user_id) {
      console.error("usuario inválido");
      return;
    }
    const response = await axios.get(API_URL + "/components/" + user_id);
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
    const response = await axios.get(`${API_URL}/total/projects/${user_id}`);
    return response.data && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Erro no Service", error);
    return [];
  }
};

export const vwSummaryStatus = async () => {
  try {
    const responseComponentStatus = await axios.get(
      "http://localhost:3001/components/status"
    );
    const responseEquipmentStatus = await axios.get(
      `${API_URL}/status/equipments/`
    );
    const responseProjectsStatus = await axios.get(
      `${API_URL}/status/projects/`
    );

    if (
      !responseComponentStatus ||
      !responseEquipmentStatus ||
      !responseProjectsStatus
    ) {
      console.error("Dados não foram devidamente requisitado");
      return undefined;
    }

    return {
      components: responseComponentStatus.data,
      equipments: responseEquipmentStatus.data,
      projects: responseProjectsStatus.data,
    };
  } catch (error) {
    console.error("Erro no service", error);
    return [];
  }
};

export const getProjectsTimeline = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects-timeline`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cronograma de projetos", error);
    return [];
  }
};

export const getEquipmentsTimeline = async () => {
  try {
    const response = await axios.get(`${API_URL}/equipments-timeline`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cronograma de equipamentos", error);
    return [];
  }
};

export const getEquipmentsTimelineByBudget = async (budget_id) => {
  try {
    if (!budget_id) {
      console.error("budget id undfinned");
      return;
    }

    const response = await axios.get(
      `${API_URL}/equipments-timeline/${budget_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cronograma de equipamentos", error);
    return [];
  }
};

export const getTasksTimeline = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks-timeline`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cronograma de tarefas detalhado", error);
    return [];
  }
};
