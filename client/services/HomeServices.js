import api from "./api.js";

/**
 * Busca a soma da quantidade de materiais usados neste ano, separados por mês.
 * Rota: /home/materials-consumption
 */
export const vwMaterialsConsumption = async () => {
  try {
    const response = await api.get("/home/materials-consumption");
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar consumo mensal de materiais",
      error
    );
    return [];
  }
};

/**
 * Busca a soma da quantidade de materiais desperdicados neste ano, separados por mês.
 * Rota: /home/materials-waste
 */
export const vwMaterialsWaste = async () => {
  try {
    const response = await api.get("/home/materials-waste");
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar consumo mensal de materiais",
      error
    );
    return [];
  }
};

/**
 * Busca a evolução dos projetos (percentual de conclusão).
 * Rota: /home/projects-evolution
 */
export const vwProjectsEvolution = async () => {
  try {
    const response = await api.get("/home/projects-evolution");
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar evolução dos projetos",
      error
    );
    return [];
  }
};

/**
 * Busca a análise de funcionários (Salário, Faltas, Horas Extras).
 * Rota: /home/employees-analytics
 */
export const vwEmployeesAnalytics = async () => {
  try {
    const response = await api.get("/home/employees-analytics");
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar análise de funcionários",
      error
    );
    return [];
  }
};

/**
 * Busca o ID do projeto baseado em um componente específico.
 * Rota: /home/project-task/:component_id
 */
export const vwProjectTask = async (component_id) => {
  try {
    if (!component_id) return null;
    
    const response = await api.get(`/home/project-task/${component_id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao buscar projeto do componente ${component_id}`,
      error
    );
    return null;
  }
};

// Adicione esta função junto com as outras
export const getHomeKPIs = async () => {
  try {
    const response = await api.get("/home/kpis");
    return response.data; 
    // Retorna: { planejado_kg: 0, processado_kg: 272, refugo_kg: 37 }
  } catch (error) {
    console.error("Erro ao buscar KPIs da Home", error);
    // Retorna zeros para não quebrar a tela em caso de erro
    return { planejado_kg: 0, processado_kg: 0, refugo_kg: 0 };
  }
};