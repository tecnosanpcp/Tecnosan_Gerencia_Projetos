import axios from "axios";
const API_URL = "http://localhost:3001/equipments";

export const getEquipment = async (project_id) => {
  try {
    if (!project_id) return null;
    const response = await axios.get(`${API_URL}/${project_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

export const listEquipments = async () => {
  try {
    const response = await axios.get(API_URL);
    if (response) return response.data;
  } catch (error) {
    console.error("Error fetching equipments", error);
  }
};
