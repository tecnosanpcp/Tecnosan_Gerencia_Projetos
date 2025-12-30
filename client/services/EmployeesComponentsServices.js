import axios from "axios";
const API_URL = "http://localhost:3001/employees_components";

export const getEmployeesComponents = async () => {
  try {
    const response = await axios.get(API_URL);
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

    const response = await axios.post(API_URL, {
      component_id,
      user_id,
    });

    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};

export const deleteEmployeesComponents = async (component_id, user_id) => {
  try {
    if (!component_id || !user_id) {
      console.error("dados insuficientes");
      return;
    }
    const response = await axios.delete(`${API_URL}/${component_id}/${user_id}`);
    return response.data;
  } catch (error) {
    console.log("Erro no service", error);
  }
};
