import api from "./api.js";

export const createProject = async (
  user_id,
  project_name,
  project_desc,
  project_local,
  start_date,
  completion_date,
  deadline,
  status,
  budget_id
) => {
  try {
    if (!user_id || !project_name || !budget_id) {
      console.error("Campos obrigatórios faltando: user_id, project_name ou budget_id.");
      return null;
    }

    const response = await api.post("/projects", {
      user_id,
      project_name,
      project_desc,
      project_local,
      status,
      budget_id,
    });
    return response.data; 
  } catch (error) {
    console.error("Erro na requisição à API:", error);
    throw error;
  }
};

export const listProjects = async (user_id) => {
  if (!user_id) return [];
  try {
    const response = await api.get(`/projects/${user_id}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};
