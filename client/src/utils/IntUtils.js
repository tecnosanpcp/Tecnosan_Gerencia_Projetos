export function parseBRL(valor) {
  // Verifica se o valor é um número válido, caso contrário retorna uma string vazia
  if (typeof valor !== 'number' || isNaN(valor)) {
    return '-';
  }

  // Cria um formatador para o padrão brasileiro
  const formatador = new Intl.NumberFormat('pt-BR', {
    style: 'currency', // Define o estilo como moeda
    currency: 'BRL',    // Define a moeda como Real Brasileiro
    minimumFractionDigits: 2, // Garante duas casas decimais
    maximumFractionDigits: 2, // Garante duas casas decimais
  });

  return formatador.format(valor);
}