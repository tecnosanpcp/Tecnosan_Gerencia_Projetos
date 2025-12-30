import { FaCircle, FaRegClock } from "react-icons/fa";

export default function TaskCard({ task, onClick }) {
  // 1. Configuração de Estilos por Status
  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return {
          border: "border-blue-500",
          bg: "bg-blue-50",
          text: "text-blue-600",
          dot: "text-blue-500",
          label: "Pendente",
        };
      case "Completed":
        return {
          border: "border-green-500",
          bg: "bg-green-50",
          text: "text-green-600",
          dot: "text-green-500",
          label: "Concluído",
        };
      case "Running":
        return {
          border: "border-yellow-500",
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          dot: "text-yellow-500",
          label: "Em Execução",
        };
      case "Delayed":
        return {
          border: "border-orange-500",
          bg: "bg-orange-50",
          text: "text-orange-600",
          dot: "text-orange-500",
          label: "Atrasado",
        };
      case "Failed":
        return {
          border: "border-red-500",
          bg: "bg-red-50",
          text: "text-red-600",
          dot: "text-red-500",
          label: "Falhou",
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          text: "text-gray-500",
          dot: "text-gray-400",
          label: status || "Indefinido",
        };
    }
  };

  const styles = getStatusStyles(task.status);

  // 2. Formatar data (ex: 20/02)
  const formatDate = (isoDate) => {
    if (!isoDate) return "--/--";
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div
      onClick={() => onClick && onClick(task)}
      className={`
        w-full rounded shadow-sm p-3 mb-3 cursor-pointer 
        hover:shadow-md transition-all duration-200 group
        flex flex-col gap-1 relative overflow-hidden
        border-l-4 ${styles.border} ${styles.bg}
      `}
    >
      {/* Nome do Componente */}
      <span className="font-semibold text-gray-800 text-sm leading-tight break-words">
        {task.component_name}
      </span>

      {/* ID do Equipamento (opcional, útil para contexto) */}
      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">
        EQ-ID: {task.equipment_id}
      </span>

      {/* Rodapé: Status e Deadline */}
      <div className="flex flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
        {/* Status com bolinha colorida */}
        <span
          className={`text-[11px] font-bold flex items-center gap-1.5 ${styles.text}`}
        >
          <FaCircle className={`w-1.5 h-1.5 ${styles.dot}`} />
          {styles.label}
        </span>

        {/* Prazo / Deadline */}
        <div
          className="flex items-center gap-1 text-[10px] text-gray-500"
          title={`Prazo: ${formatDate(task.deadline)}`}
        >
          <FaRegClock />
          <span>{formatDate(task.deadline)}</span>
        </div>
      </div>
    </div>
  );
}
