import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

// Importe suas funções de serviço corretamente
import { projectTask, employeesTask } from "@services/ViewsService.js";

export default function ProductionBoard({
  weekDays,
  tasks, // A lista bruta original
  responsible,
  setIsAddOpen,
  employees,
  recipes,
  selectedDept = [],
  selectedProj = [],
  selectedEmp = [],
  onFilteredDataChange // <--- NOVA PROP
}) {
  const [isOpen, setOpen] = useState(false);
  const [selectTask, setSelectTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState(tasks || []);

 // --- LÓGICA DE FILTRAGEM FINAL ---
  useEffect(() => {
    let isCancelled = false;

    const applyFilters = async () => {
      // 1. Validações básicas
      if (!tasks || tasks.length === 0) {
        setFilteredTasks([]);
        if(onFilteredDataChange) onFilteredDataChange([]); // Atualiza Pai
        return;
      }

      // 2. Se não tiver filtros, mostra tudo
      if (
        selectedDept.length === 0 &&
        selectedEmp.length === 0 &&
        selectedProj.length === 0
      ) {
        setFilteredTasks(tasks);
        if(onFilteredDataChange) onFilteredDataChange(tasks); // Atualiza Pai
        return;
      }

      // 3. Processamento
      const filterPromises = tasks.map(async (task) => {
        let isValid = true;

        // --- FILTRO 1: DEPARTAMENTO ---
        if (selectedDept.length > 0) {
          if (Number(task.department_id) !== Number(selectedDept[0])) {
            isValid = false;
          }
        }

        // --- FILTRO 2: FUNCIONÁRIO ---
        if (isValid && selectedEmp.length > 0) {
          try {
            const taskEmps = await employeesTask(task.component_id);
            const targetId = Number(selectedEmp[0]);
            
            // Garante array
            const list = Array.isArray(taskEmps) ? taskEmps : [];

            const hasEmployee = list.some((e) => {
               const id = e?.user_id ?? e?.USER_ID ?? e?.id;
               return Number(id) === targetId;
            });

            if (!hasEmployee) isValid = false;

          } catch (err) {
            console.error(`Erro func task ${task.component_id}`, err);
            isValid = false; 
          }
        }

        // --- FILTRO 3: PROJETO ---
        if (isValid && selectedProj.length > 0) {
          try {
            const resultProj = await projectTask(task.component_id);
            const targetProjId = Number(selectedProj[0]);
            
            const projId = resultProj?.project_id ?? resultProj?.PROJECT_ID ?? resultProj?.id;

            if (Number(projId) !== targetProjId) {
              isValid = false;
            }
          } catch (err) {
             console.error(`Erro proj task ${task.component_id}`, err);
             isValid = false;
          }
        }

        return isValid ? task : null;
      });

      const results = await Promise.all(filterPromises);
      
      // Filtra os nulos e atualiza o estado se o componente ainda estiver montado
      if (!isCancelled) {
        const finalResults = results.filter((t) => t !== null);
        setFilteredTasks(finalResults);
        // Atualiza o Pai com a lista filtrada
        if(onFilteredDataChange) onFilteredDataChange(finalResults);
      }
    };

    applyFilters();

    // Cleanup function para evitar race conditions
    return () => { isCancelled = true; };
  }, [tasks, selectedDept, selectedEmp, selectedProj, onFilteredDataChange]);

  const capitalizeFirst = (text) => {
    if (!text) return "";
    return text
      .split("-")
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join("-");
  };

  const handleTaskClick = (task) => {
    setOpen(!isOpen);
    setSelectTask(task);
  };

  return (
    <React.Fragment>
      <TaskModal
        isOpen={isOpen}
        setOpen={setOpen}
        taskData={selectTask}
        employees={employees}
        responsible={responsible.filter(
          (res) => selectTask?.component_id == res.component_id
        )}
        recipe={recipes.find(
          (rec) => selectTask?.component_recipe_id == rec.component_recipe_id
        )}
      />

      <div className="card overflow-x-auto">
        <div className="flex w-full h-min-96 gap-2">
          {weekDays.map((day, idx) => {
            const dayTasks = filteredTasks.filter((t) => {
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

                {/* Lista de Tarefas */}
                <div className="flex-1 flex flex-col items-center p-2 overflow-y-auto custom-scrollbar">
                  {dayTasks.length > 0 ? (
                    dayTasks.map((task) => (
                      <TaskCard
                        key={task.component_id}
                        task={task}
                        onClick={handleTaskClick}
                      />
                    ))
                  ) : (
                    // Botão de adicionar
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
    </React.Fragment>
  );
}