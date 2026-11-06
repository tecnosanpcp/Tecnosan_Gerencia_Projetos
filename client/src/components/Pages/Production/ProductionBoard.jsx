import React, { useEffect, useRef, useState } from "react";

import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

import { projectTask, employeesTask } from "@services/ViewsService.js";

import { updateDate } from "@services/ComponentsServices.js";

function formatDateForAPI(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function changeDayKeepTime(originalDate, targetDate) {
  const original = new Date(originalDate);

  const target = new Date(targetDate);

  target.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    0,
  );

  return target;
}

function capitalizeFirst(text) {
  if (!text) return "";

  return text
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export default function ProductionBoard({
  weekDays,
  offset,
  setOffset,
  tasks,
  responsible,
  setIsAddOpen,
  employees,
  recipes,
  selectedDept = [],
  selectedProj = [],
  selectedEmp = [],
  onFilteredDataChange,
  onTaskMoved,
}) {
  const [isOpen, setOpen] = useState(false);

  const [selectTask, setSelectTask] = useState(null);

  const [filteredTasks, setFilteredTasks] = useState(tasks || []);

  const [draggedTask, setDraggedTask] = useState(null);

  const [dragOverDate, setDragOverDate] = useState(null);

  const [movingTaskId, setMovingTaskId] = useState(null);

  /*
   * ==========================================================
   * NAVEGAÇÃO COM AS SETAS DO TECLADO
   * ==========================================================
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        setOffset((current) => current - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        setOffset((current) => current + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setOffset]);
  /*
   * ==========================================================
   * NAVEGAÇÃO AUTOMÁTICA DURANTE DRAG
   * ==========================================================
   */

  const edgeDirectionRef = useRef(null);
  const edgeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
      }
    };
  }, []);

  const handleEdgeNavigation = (direction) => {
    if (!draggedTask || movingTaskId) {
      return;
    }

    if (edgeDirectionRef.current === direction) {
      return;
    }

    edgeDirectionRef.current = direction;

    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);
    }

    edgeTimerRef.current = setTimeout(() => {
      setOffset((currentOffset) => currentOffset + direction);

      edgeTimerRef.current = null;
    }, 600);
  };

  const handleBoardDragOver = (event) => {
    if (!draggedTask || movingTaskId) {
      return;
    }

    const board = event.currentTarget;
    const rect = board.getBoundingClientRect();

    const x = event.clientX - rect.left;

    const edgeSize = 90;

    const isLeftEdge = x <= edgeSize;

    const isRightEdge = x >= rect.width - edgeSize;

    if (isLeftEdge) {
      handleEdgeNavigation(-1);
      return;
    }

    if (isRightEdge) {
      handleEdgeNavigation(1);
      return;
    }

    edgeDirectionRef.current = null;

    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);

      edgeTimerRef.current = null;
    }
  };

  /*
   * ==========================================================
   * FILTROS
   * ==========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function applyFilters() {
      if (!tasks || tasks.length === 0) {
        setFilteredTasks([]);

        onFilteredDataChange?.([]);

        return;
      }

      if (
        selectedDept.length === 0 &&
        selectedEmp.length === 0 &&
        selectedProj.length === 0
      ) {
        setFilteredTasks(tasks);

        onFilteredDataChange?.(tasks);

        return;
      }

      const results = await Promise.all(
        tasks.map(async (task) => {
          let valid = true;

          /*
           * Departamento
           */

          if (selectedDept.length > 0) {
            valid = Number(task.department_id) === Number(selectedDept[0]);
          }

          /*
           * Funcionário
           */

          if (valid && selectedEmp.length > 0) {
            try {
              const taskEmployees = await employeesTask(task.component_id);

              const employeeList = Array.isArray(taskEmployees)
                ? taskEmployees
                : [];

              valid = employeeList.some((employee) => {
                const id =
                  employee?.user_id ?? employee?.USER_ID ?? employee?.id;

                return Number(id) === Number(selectedEmp[0]);
              });
            } catch (error) {
              console.error("Erro ao filtrar funcionário:", error);

              valid = false;
            }
          }

          /*
           * Projeto
           */

          if (valid && selectedProj.length > 0) {
            try {
              const result = await projectTask(task.component_id);

              const projectId =
                result?.project_id ?? result?.PROJECT_ID ?? result?.id;

              valid = Number(projectId) === Number(selectedProj[0]);
            } catch (error) {
              console.error("Erro ao filtrar projeto:", error);

              valid = false;
            }
          }

          return valid ? task : null;
        }),
      );

      if (cancelled) {
        return;
      }

      const finalTasks = results.filter(Boolean);

      setFilteredTasks(finalTasks);

      onFilteredDataChange?.(finalTasks);
    }

    applyFilters();

    return () => {
      cancelled = true;
    };
  }, [tasks, selectedDept, selectedProj, selectedEmp, onFilteredDataChange]);

  /*
   * ==========================================================
   * DRAG START
   * ==========================================================
   */

  const handleDragStart = (event, task) => {
    if (movingTaskId) {
      return;
    }

    edgeDirectionRef.current = null;

    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);

      edgeTimerRef.current = null;
    }

    setDraggedTask(task);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", String(task.component_id));
  };

  /*
   * ==========================================================
   * DRAG END
   * ==========================================================
   */

  const handleDragEnd = () => {
    edgeDirectionRef.current = null;

    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);

      edgeTimerRef.current = null;
    }

    setDragOverDate(null);
  };

  /*
   * ==========================================================
   * DRAG OVER
   * ==========================================================
   */

  const handleDragOver = (event, day) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverDate(day.dateKey);
  };

  /*
   * ==========================================================
   * DROP
   * ==========================================================
   */

  const handleDrop = async (event, targetDay) => {
    event.preventDefault();

    setDragOverDate(null);

    edgeDirectionRef.current = null;

    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);

      edgeTimerRef.current = null;
    }

    if (!draggedTask) {
      return;
    }

    if (movingTaskId) {
      return;
    }

    const currentDate = new Date(draggedTask.start_date);

    const currentDateKey = currentDate.toLocaleDateString("pt-BR");

    /*
     * Se soltou no mesmo dia,
     * não precisa chamar a API.
     */

    if (currentDateKey === targetDay.dateKey) {
      setDraggedTask(null);

      return;
    }

    /*
     * ========================================================
     * IMPORTANTE
     *
     * NÃO bloqueamos mais dias que já possuem componentes.
     *
     * Agora é permitido:
     *
     * Componente A
     * Componente B
     * Componente C
     * + Adicionar
     *
     * no mesmo dia.
     * ========================================================
     */

    const newDate = changeDayKeepTime(
      draggedTask.start_date,
      targetDay.dateObj,
    );

    const newStartDate = formatDateForAPI(newDate);

    const previousTask = {
      ...draggedTask,
    };

    const optimisticTask = {
      ...draggedTask,
      start_date: newStartDate,
    };

    /*
     * Atualização otimista.
     *
     * O card muda de dia imediatamente,
     * sem esperar a resposta da API.
     */

    setFilteredTasks((current) => {
      const updatedTasks = current.map((task) =>
        Number(task.component_id) === Number(draggedTask.component_id)
          ? optimisticTask
          : task,
      );

      onFilteredDataChange?.(updatedTasks);

      return updatedTasks;
    });

    setMovingTaskId(draggedTask.component_id);

    try {
      const response = await updateDate(
        draggedTask.component_id,
        newStartDate,
        draggedTask.deadline,
      );

      /*
       * O service atual retorna undefined
       * quando ocorre erro.
       */

      if (response === undefined) {
        throw new Error("A API não confirmou a alteração.");
      }

      /*
       * Informa ao componente pai
       * que o componente mudou.
       */

      onTaskMoved?.({
        ...draggedTask,
        start_date: newStartDate,
      });
    } catch (error) {
      console.error("Erro ao mover componente:", error);

      /*
       * ======================================================
       * ROLLBACK
       * ======================================================
       *
       * Se a API falhar, volta para o
       * dia anterior.
       */

      setFilteredTasks((current) =>
        current.map((task) =>
          Number(task.component_id) === Number(draggedTask.component_id)
            ? previousTask
            : task,
        ),
      );

      onFilteredDataChange?.(
        filteredTasks.map((task) =>
          Number(task.component_id) === Number(draggedTask.component_id)
            ? previousTask
            : task,
        ),
      );

      alert("Não foi possível mover o componente.");
    } finally {
      setMovingTaskId(null);

      setDraggedTask(null);
    }
  };

  /*
   * ==========================================================
   * TASK CLICK
   * ==========================================================
   */

  const handleTaskClick = (task) => {
    if (movingTaskId) {
      return;
    }

    setSelectTask(task);

    setOpen(true);
  };

  /*
   * ==========================================================
   * BOARD
   * ==========================================================
   */

  return (
    <>
      <TaskModal
        isOpen={isOpen}
        setOpen={setOpen}
        taskData={selectTask}
        employees={employees}
        responsible={responsible.filter(
          (item) =>
            Number(item.component_id) === Number(selectTask?.component_id),
        )}
        recipe={recipes.find(
          (recipe) =>
            Number(recipe.component_recipe_id) ===
            Number(selectTask?.component_recipe_id),
        )}
      />

      <section
        onDragOver={handleBoardDragOver}
        className="
          h-full
          w-full
          overflow-hidden
          border
          border-[#DFE1E6]
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            grid
            h-full
            min-h-0
            grid-cols-7
          "
        >
          {weekDays.map((day) => {
            const dayTasks = filteredTasks.filter((task) => {
              if (!task.start_date) {
                return false;
              }

              return (
                new Date(task.start_date).toLocaleDateString("pt-BR") ===
                day.dateKey
              );
            });

            const isDropTarget = dragOverDate === day.dateKey;

            return (
              <div
                key={day.dateKey}
                onDragOver={(event) => handleDragOver(event, day)}
                onDrop={(event) => handleDrop(event, day)}
                className={`
                    min-w-0
                    border-r
                    border-[#DFE1E6]
                    last:border-r-0
                    transition-colors
                    ${isDropTarget ? "bg-[#DEEBFF]" : "bg-white"}
                  `}
              >
                {/* =================================================
                        CABEÇALHO DO DIA
                    ================================================= */}

                <div
                  className={`
                      border-b
                      border-[#DFE1E6]
                      px-2
                      py-3
                      text-center
                      ${isDropTarget ? "bg-[#B3D4FF]" : "bg-[#F4F5F7]"}
                    `}
                >
                  <p
                    className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-[#5E6C84]
                      "
                  >
                    {capitalizeFirst(
                      day.dateObj.toLocaleDateString("pt-BR", {
                        weekday: "long",
                      }),
                    )}
                  </p>

                  <p
                    className="
                        mt-1
                        text-xl
                        font-bold
                        text-[#172B4D]
                      "
                  >
                    {day.dateObj.getDate()}
                  </p>

                  <p
                    className="
                        text-[10px]
                        text-[#97A0AF]
                      "
                  >
                    {day.dateKey}
                  </p>
                </div>

                {/* =================================================
                        COMPONENTES DO DIA
                    ================================================= */}

                <div
                  className="
                      flex
                      h-[calc(100vh-280px)]
                      min-h-0
                      flex-col
                      gap-2
                      overflow-y-auto
                      overflow-x-hidden
                      p-2
                    "
                >
                  {dayTasks.map((task) => (
                    <TaskCard
                      key={task.component_id}
                      task={task}
                      onClick={handleTaskClick}
                      draggable
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      responsible={responsible.find(
                        (item) =>
                          Number(item.component_id) ===
                          Number(task.component_id),
                      )}
                      employees={employees}
                      isMoving={
                        Number(movingTaskId) === Number(task.component_id)
                      }
                    />
                  ))}

                  {/* =================================================
                          CARD ADICIONAR

                          IMPORTANTE:
                          Ele aparece SEMPRE, mesmo quando
                          existem componentes no dia.
                      ================================================= */}

                  <button
                    type="button"
                    onClick={() => setIsAddOpen(day.dateKey)}
                    className="
                        mt-1
                        flex
                        min-h-[96px]
                        w-full
                        flex-col
                        items-center
                        justify-center
                        rounded-lg
                        border-2
                        border-dashed
                        border-[#DFE1E6]
                        bg-white
                        text-[#97A0AF]
                        transition-all
                        duration-150
                        hover:border-[#0052CC]
                        hover:bg-[#DEEBFF]
                        hover:text-[#0052CC]
                      "
                  >
                    <span
                      className="
                          text-2xl
                          font-light
                          leading-none
                        "
                    >
                      +
                    </span>

                    <span
                      className="
                          mt-1
                          text-xs
                          font-semibold
                        "
                    >
                      Adicionar
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
