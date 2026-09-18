import {
  FaCircle,
  FaRegClock,
  FaGripVertical,
} from "react-icons/fa";

export default function TaskCard({
  task,
  onClick,
  draggable = false,
  onDragStart,
  isMoving = false,
}) {
  const getStatusStyles = (status) => {
  switch (status) {
    case "Pending":
      return {
        border: "border-[#0052CC]",
        bg: "bg-[#E9F2FF]",
        text: "text-[#0052CC]",
        dot: "text-[#0052CC]",
        label: "Pendente",
      };

    case "Completed":
      return {
        border: "border-[#00875A]",
        bg: "bg-[#E7F7F0]",
        text: "text-[#00875A]",
        dot: "text-[#00875A]",
        label: "Concluído",
      };

    case "Running":
      return {
        border: "border-[#FF991F]",
        bg: "bg-[#FFF3E0]",
        text: "text-[#C66A00]",
        dot: "text-[#C66A00]",
        label: "Em execução",
      };

    case "Delayed":
      return {
        border: "border-[#DE350B]",
        bg: "bg-[#FCE8E4]",
        text: "text-[#DE350B]",
        dot: "text-[#DE350B]",
        label: "Atrasado",
      };

    case "Failed":
      return {
        border: "border-[#DE350B]",
        bg: "bg-[#FCE8E4]",
        text: "text-[#DE350B]",
        dot: "text-[#DE350B]",
        label: "Falhou",
      };

    default:
      return {
        border: "border-[#5E6C84]",
        bg: "bg-[#F4F5F7]",
        text: "text-[#5E6C84]",
        dot: "text-[#5E6C84]",
        label: status || "Indefinido",
      };
  }
};

  const styles =
    getStatusStyles(
      task.status
    );

  const formatTime = (
    value
  ) => {
    if (!value) {
      return "--:--";
    }

    return new Date(
      value
    ).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <article
      draggable={
        draggable &&
        !isMoving
      }
      onDragStart={(event) =>
        onDragStart?.(
          event,
          task
        )
      }
      onClick={() =>
        onClick?.(task)
      }
      className={`
        group
        relative
        w-full
        rounded-lg
        border-l-4
        ${styles.border}
        ${styles.bg}
        p-3
        shadow-sm
        transition-all
        ${
          isMoving
            ? "cursor-grabbing opacity-40"
            : "cursor-grab hover:-translate-y-[1px] hover:shadow-md"
        }
      `}
    >
      <div
        className="
          absolute
          right-2
          top-2
          text-[#97A0AF]
          opacity-0
          transition
          group-hover:opacity-100
        "
      >
        <FaGripVertical
          size={12}
        />
      </div>

      <p
        className="
          pr-5
          text-sm
          font-semibold
          leading-tight
          text-[#172B4D]
        "
      >
        {task.component_name ||
          "Componente"}
      </p>

      <p
        className="
          mt-1
          font-mono
          text-[10px]
          uppercase
          tracking-wide
          text-[#97A0AF]
        "
      >
        EQ-ID:{" "}
        {task.equipment_id ??
          "-"}
      </p>

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          border-t
          border-[#DFE1E6]/70
          pt-2
        "
      >
        <span
          className={`
            flex
            items-center
            gap-1.5
            text-[10px]
            font-semibold
            ${styles.text}
          `}
        >
          <FaCircle
            className={`
              h-1.5
              w-1.5
              ${styles.dot}
            `}
          />

          {styles.label}
        </span>

        <span
          className="
            flex
            items-center
            gap-1
            text-[10px]
            text-[#5E6C84]
          "
        >
          <FaRegClock />

          {formatTime(
            task.start_date
          )}
        </span>
      </div>
    </article>
  );
}