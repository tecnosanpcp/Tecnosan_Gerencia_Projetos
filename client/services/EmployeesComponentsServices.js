import api from "./api.js"

export const getEmployeesComponents = async () => {
  try {
    const response = await api.get("/employees_components");
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.error("Erro ao listar componentes", error);
  }
};

export const createEmployeesComponents = async (component_id, user_id) => {
  try {
    if (!component_id || !user_id) {
      console.error("dados insuficientes");
      return;
    }

    const response = await api.post("/employees_components", {
      component_id,
      user_id,
    });

    return response.data;
  } catch (error) {
    console.error("Erro no service", error);
  }
};

export const deleteEmployeesComponents = async (component_id, user_id) => {
  try {
    if (!component_id || !user_id) {
      console.error("dados insuficientes");
      return;
    }
    const response = await api.delete(`/employees_components/${component_id}/${user_id}`);
    return response.data;
  } catch (error) {
    console.error("Erro no service", error);
  }
};
