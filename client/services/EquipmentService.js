import api from "./api.js";

export const getEquipment = async (project_id) => {
  try {
    if (!project_id) return null;
    const response = await api.get(`/equipments/${project_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

export const listEquipments = async () => {
  try {
    const response = await api.get("/equipments");
    if (response) return response.data;
  } catch (error) {
    console.error("Error fetching equipments", error);
  }
};

export const createEquipment = async (
  equipment_name,
  start_date,
  deadline,
  project_id,
  equipment_recipe_id
) => {
  try {
    if (
      !equipment_name ||
      !start_date ||
      !deadline ||
      !project_id ||
      equipment_recipe_id
    ) {
      throw new Error("Faltando dados");
    }

    const response = await api.post("/equipments", {
      equipment_name,
      start_date,
      deadline,
      project_id,
      equipment_recipe_id,
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
};
