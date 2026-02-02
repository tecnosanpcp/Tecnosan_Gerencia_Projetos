import api from "./api.js"

export const listDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    console.error("Error ao listar departamentos", error);
  }
};

export const createDeparment = async (department_name) => {
  try {
    const response = await api.post("/departments", { department_name });
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar novo departamento", error);
  }
};

export const editDepartment = async (department_id, department_name) => {
  try {
    const response = await api.put("/departments", {
      department_id,
      department_name,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao editar departamento", error);
  }
};

export const deleteDepartment = async (department_id) => {
  try {
    const response = await api.delete("/departments", {
      params: { department_id },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir departamento", error);
  }
};

