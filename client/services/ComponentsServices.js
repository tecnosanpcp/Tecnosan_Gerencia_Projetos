import api from "./api.js";

export const countStatusComponents = async (
  project_id,
  equipment_id,
  start_date,
  end_date
) => {
  try {
    const response = await api.get(
      `/components/status/${project_id}/${equipment_id}/${start_date}/${end_date}`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao contar status dos componentes", error);
  }
};

export const countStatusComponentsByProj = async (
  project_id,
  equipment_id,
  start_date,
  end_date
) => {
  try {
    const response = await api.get(`/components/statusByProj`, {
      params: {
        project_id,
        equipment_id,
        start_date,
        end_date
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Erro ao contar status dos componentes", error);
    return []; // Retorna array vazio em caso de erro real de rede
  }
};

export const getComponents = async () => {
  try {
    const response = await api.get("/components");
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.error("Erro ao listar componentes", error);
  }
};

export const createComponents = async (
  component_name,
  completion_date,
  start_date,
  deadline,
  status,
  equipment_id,
  department_id,
  component_recipe_id
) => {
  try {
    if (
      !component_name ||
      !start_date ||
      !deadline ||
      !status ||
      !equipment_id ||
      !department_id ||
      !component_recipe_id
    ) {
      console.error("dados insuficientes");
      return;
    }

    const response = await api.post("/components", {
      component_name,
      completion_date,
      start_date,
      deadline,
      status,
      equipment_id,
      department_id,
      component_recipe_id,
    });

    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};

export const updateComponents = async (
  component_id,
  completion_date,
  start_date,
  deadline,
  status,
  department_id,
  total_time_spent
) => {
  try {
    if (!component_id || !status) {
      console.error("IDs e Status são obrigatórios");
      return;
    }

    const response = await api.put(`/components/${component_id}`, {
      completion_date,
      start_date,
      deadline,
      status,
      department_id,
      total_time_spent,
    });

    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};

export const deleteComponents = async (component_id) => {
  try {
    if (!component_id) {
      console.error("dados insuficientes");
      return;
    }
    const response = await api.delete(`/components/${component_id}`);
    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};
