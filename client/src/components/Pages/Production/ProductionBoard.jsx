import TaskCard from "./TaskCard";

export default function ProductionBoard({ weekDays, tasks, setIsAddOpen }) {
  const capitalizeFirst = (text) => {
    if (!text) return "";
    return text
      .split("-")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join("-");
  };

  const handleTaskClick = (task) => {
    console.log("Tarefa clicada:", task);
  };

  return (
    <div className="card overflow-x-auto">
      <div className="flex w-full h-min-96 gap-2">
        {weekDays.map((day, idx) => {
          const dayTasks = tasks.filter((t) => {
            const taskDateKey = new Date(t.start_date).toLocaleDateString(
              "pt-BR"
            );
            return taskDateKey === day.dateKey;
          });

          return (
            <div
              key={idx}
              className="flex-1 min-w-[180px] flex flex-col border-r last:border-r-0 h-full rounded-md overflow-hidden bg-white/50"
            >
              {/* Cabeçalho */}
              <div className="bg-gray-100/80 text-center py-2 border-b sticky top-0 z-10">
                <div className="font-bold text-md text-gray-700">
                  {capitalizeFirst(
                    day.dateObj.toLocaleDateString("pt-BR", {
                      weekday: "long",
                    })
                  )}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {day.dateKey}
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 flex flex-col items-center p-2 overflow-y-auto custom-scrollbar">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                    />
                  ))
                ) : (
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-md w-full h-24 mt-2 opacity-50 hover:opacity-100 hover:border-blue-400 hover:text-blue-500 transition-all"
                  >
                    <span className="text-2xl mb-1">+</span>
                    <span className="text-xs font-medium">Adicionar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
