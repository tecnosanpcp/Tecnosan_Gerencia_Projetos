import axios from "axios";
const API_URL = "http://localhost:3001/components";

export const countStatusComponents = async (
  project_id,
  start_date,
  end_date
) => {
  try {
    const response = await axios.get(API_URL + "/status_count", {
      params: {
        project_id: project_id,
        start_date: start_date,
        end_date: end_date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao contar status dos componentes", error);
  }
};

export const getComponents = async () => {
  try {
    const response = await axios.get(API_URL);
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
  department_id
) => {
  try {
    if (
      !component_name ||
      !start_date ||
      !deadline ||
      !status ||
      !equipment_id ||
      ! department_id
    ) {
      console.error("dados insuficientes");
      return;
    }

    const response = await axios.post(API_URL, {
      component_name,
      completion_date,
      start_date,
      deadline,
      status,
      equipment_id,
      department_id
    });

    console.log(`DATA: ${response.data}`)
    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};

export const updateComponents = async (
  component_id,
  component_name,
  completion_name,
  start_date,
  deadline,
  status,
  equipment_id
) => {
  try {
    if (
      !component_id ||
      !component_name ||
      !completion_name ||
      !start_date ||
      !deadline ||
      !status ||
      !equipment_id
    ) {
      console.error("dados insuficientes");
      return;
    }

    const response = await axios.put(`${API_URL}/${component_id}`, {
      component_name,
      completion_name,
      start_date,
      deadline,
      status,
      equipment_id,
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
    const response = await axios.delete(`${API_URL}/${component_id}`);
    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};
