import api from "./api.js";
const BASE_URL = "/timesheets";

// 1. CRIAR (POST /)
// Espera: { component_id, user_id, start_time, end_time }
export const createTimesheet = async (data) => {
  try {
    const response = await api.post(`${BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar timesheet:", error);
    throw error;
  }
};

// 2. BUSCAR POR COMPONENTE (GET /component/:component_id)
export const getTimesheetsByComponent = async (component_id) => {
  try {
    const response = await api.get(`${BASE_URL}/component/${component_id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar timesheets:", error);
    throw error;
  }
};

// 3. ATUALIZAR (PUT /:timesheet_id)
// Espera: timesheet_id e objeto { start_time, end_time }
export const updateTimesheet = async (timesheet_id, start_time, end_time) => {
  try {
    const response = await api.put(`${BASE_URL}/${timesheet_id}`, {
      start_time,
      end_time,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar timesheet:", error);
    throw error;
  }
};

// 4. DELETAR (DELETE /:timesheet_id)
export const deleteTimesheet = async (timesheet_id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${timesheet_id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar timesheet:", error);
    throw error;
  }
};
