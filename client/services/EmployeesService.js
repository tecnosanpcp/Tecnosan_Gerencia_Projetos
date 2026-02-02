import api from "./api.js";

export const listEmployees = async () => {
  try {
    const response = await api.get("/employees");
    return response.data;
  } catch (err) {
    console.error("Erro ao listar funcionários", err);
    throw err;
  }
};

export const createEmployee = async (
  email,
  user_name,
  password,
  access_type,
  salary,
  job_title,
  department_id
) => {
  try {
    const response = await api.post("/employees", {
      email,
      user_name,
      password,
      access_type,
      salary,
      job_title,
      department_id,
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao cadastrar novo funcionário", err);
    throw err;
  }
};

export const editEmployee = async (
  user_id,
  email,
  user_name,
  pass,
  access_type,
  salary,
  performance,
  job_title,
  fk_department_id
) => {
  try {
    const response = await api.put("/employees", {
      user_id,
      email,
      user_name,
      pass,
      access_type,
      salary,
      performance,
      job_title,
      fk_department_id,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao editar funcionário", error);
    throw error;
  }
};
