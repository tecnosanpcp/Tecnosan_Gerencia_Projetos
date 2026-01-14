import api from "./api.js";

export const createProject = async (
  user_id,
  project_name,
  project_desc,
  project_local,
  start_date,
  end_date,
  deadline,
  status,
  budget_id
) => {
  try {
    if (!user_id || !project_name || !budget_id) {
      console.error("Missing required fields.");
      return;
    }

    const response = await api.post("/projects", {
      user_id,
      project_name,
      project_desc,
      project_local,
      start_date,
      end_date,
      deadline,
      status,
      budget_id,
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(error);
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
