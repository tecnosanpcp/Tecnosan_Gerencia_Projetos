import { useState, useEffect } from "react";
import NavBar from "../../Ui/NavBar";
import AddComponent from "../../Ui/AddComponent";

// Componentes
import ProductionHeader from "./ProductionHeader";
import ProductionFilters from "./ProductionFilters";
import ProductionBoard from "./ProductionBoard";

// Services
import { listDepartments } from "@services/DepartmentService.js";
import { listProjects } from "@services/ProjectService.js";
import { listEmployees } from "@services/EmployeesService.js";
import { listEquipments } from "@services/EquipmentService.js";
import { getComponents } from "@services/ComponentsServices.js";
import { VerifyAuth } from "@services/AuthService.js";

/**
 * Gera a semana atual (ou deslocada) sem bugs de timezone
 */
function generateWeek(weekOffset = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + weekOffset * 7);

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const week = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    day.setHours(0, 0, 0, 0);

    week.push({
      dateObj: day, // Mantenha o objeto Date original se precisar fazer contas depois

      // ESTA É A CHAVE MÁGICA PARA COMPARAÇÃO
      dateKey: day.toLocaleDateString("pt-BR"), // Retorna "12/01/2025"

      formatted: day.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      }),
    });
  }

  return week;
}

export default function Production() {
  const [offset, setOffset] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // --- Estados de Dados ---
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedProj, setSelectedProj] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState([]);

  const [equipments, setEquipments] = useState([]);

  const [tasks, setTasks] = useState([]);

  // --- Semana ---
  const weekDays = generateWeek(offset);

  // --- Fetch Data ---
  useEffect(() => {
    async function loadData() {
      try {
        const user = await VerifyAuth();

        const [deptData, empData, projData, compData, equipData] =
          await Promise.all([
            listDepartments(),
            listEmployees(),
            listProjects(user.user_id),
            getComponents(),
            listEquipments(),
          ]);

        if (deptData) setDepartments(deptData);
        if (empData) setEmployees(empData);
        if (projData) setProjects(projData);
        if (compData) setTasks(compData);
        if (equipData) setEquipments(equipData);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <AddComponent
        isOpen={isAddOpen}
        setOpen={setIsAddOpen}
        departmens={departments}
        projects={projects}
        equipments={equipments}
        employees={employees}
      />

      <div className="bg-slate-200 flex flex-col space-y-5 rounded-lg p-0 m-0 min-h-screen">
        <NavBar select_index={2} />

        <ProductionHeader
          weekDays={weekDays}
          setIsAddOpen={setIsAddOpen}
          offset={offset}
          setOffset={setOffset}
        />

        <ProductionFilters
          departments={departments}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          projects={projects}
          selectedProj={selectedProj}
          setSelectedProj={setSelectedProj}
          employees={employees}
          selectedEmp={selectedEmp}
          setSelectedEmp={setSelectedEmp}
        />

        <ProductionBoard
          weekDays={weekDays}
          tasks={tasks}
          setIsAddOpen={setIsAddOpen}
        />
      </div>
    </>
  );
}
