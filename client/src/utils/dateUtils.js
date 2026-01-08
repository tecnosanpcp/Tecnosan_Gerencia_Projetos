export const generateDateList = (numberOfDays, startDate = new Date()) => {
  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return date;
  });
};

export const formatDateForInput = (isoString) => {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  
  // O input datetime-local não sabe lidar com fusos automaticamente (ele mostra "tempo de parede").
  // Se quisermos mostrar a hora local correta (ex: Brasil -3h), precisamos ajustar:
  const offset = date.getTimezoneOffset() * 60000; // Converte offset em minutos para ms
  const localDate = new Date(date.getTime() - offset);
  
  // Retorna yyyy-MM-ddThh:mm e remove o 'Z' e milissegundos
  return localDate.toISOString().slice(0, 16);
};

/**
 * Retorna um objeto com data de início (X meses atrás) e fim (X meses a frente)
 * formatados como string YYYY-MM-DD.
 */
export const getDefaultDateRange = (monthsOffset = 3) => {
  const today = new Date();
  
  const start = new Date(today);
  start.setMonth(today.getMonth() - monthsOffset);
  
  const end = new Date(today);
  end.setMonth(today.getMonth() + monthsOffset);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Formata a data para o padrão esperado pela API ou Banco de Dados.
 * Ex: "2025-01-01" -> "2025-01-01 00:00:00"
 */
export const formatDateForApi = (dateStr) => {
  if (!dateStr) return null;
  // Garante que pega apenas a parte da data e adiciona o horário zerado
  return `${dateStr.split(" ")[0]} 00:00:00`;
};