import { useState, useEffect, useCallback } from "react";

import AddComponent from "../../Ui/AddComponent";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import ProductionHeader from "./ProductionHeader";
import ProductionFilters from "./ProductionFilters";
import ProductionBoard from "./ProductionBoard";

import { listDepartments } from "@services/DepartmentService.js";
import { listProjects } from "@services/ProjectService.js";
import { listEmployees } from "@services/EmployeesService.js";
import { listEquipments } from "@services/EquipmentService.js";
import { getComponents } from "@services/ComponentsServices.js";
import { VerifyAuth } from "@services/AuthService.js";
import { getComponentRecipe } from "@services/ComponentRecipes.js";
import { getEmployeesComponents } from "@services/EmployeesComponentsServices.js";

function generateWeek(weekOffset = 0) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + weekOffset * 7);

  const dayOfWeek = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startOfWeek);

    day.setDate(startOfWeek.getDate() + index);
    day.setHours(0, 0, 0, 0);

    return {
      dateObj: day,

      dateKey: day.toLocaleDateString("pt-BR"),

      formatted: day.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      }),
    };
  });
}

export default function Production() {
  const [offset, setOffset] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [selectedAddDate, setSelectedAddDate] = useState("");

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedProj, setSelectedProj] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState([]);

  const [equipments, setEquipments] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [responsible, setResponsible] = useState([]);

  const [currentViewTasks, setCurrentViewTasks] = useState([]);

  const weekDays = generateWeek(offset);

  /*
   * ==========================================================
   * CARREGAMENTO
   * ==========================================================
   */

  const loadData = useCallback(async () => {
    try {
      const user = await VerifyAuth();

      const [
        deptData,
        empData,
        projData,
        compData,
        equipData,
        recipesData,
        emplCompData,
      ] = await Promise.all([
        listDepartments(),
        listEmployees(),
        listProjects(user.user_id),
        getComponents(),
        listEquipments(),
        getComponentRecipe(),
        getEmployeesComponents(),
      ]);

      setDepartments(deptData || []);
      setEmployees(empData || []);
      setProjects(projData || []);
      setTasks(compData || []);
      setEquipments(equipData || []);
      setRecipes(recipesData || []);
      setResponsible(emplCompData || []);
    } catch (error) {
      console.error("Erro ao carregar produção:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * ==========================================================
   * NOMES
   * ==========================================================
   */

  const findProjectName = (id) => {
    return (
      projects.find(
        (project) => Number(project.project_id) === Number(id),
      )?.project_name || "N/A"
    );
  };

  const findDeptName = (id) => {
    return (
      departments.find(
        (department) =>
          Number(department.department_id) === Number(id),
      )?.department_name || "N/A"
    );
  };

  /*
   * ==========================================================
   * EXPORTAÇÃO
   * ==========================================================
   */

  const getExportData = () => {
    const weekDates = new Set(
      weekDays.map((day) => day.dateKey),
    );

    const tasksInWeek = currentViewTasks.filter((task) => {
      if (!task.start_date) {
        return false;
      }

      const dateKey = new Date(
        task.start_date,
      ).toLocaleDateString("pt-BR");

      return weekDates.has(dateKey);
    });

    return tasksInWeek.map((task) => {
      const relation = responsible.find(
        (item) =>
          Number(item.component_id) ===
          Number(task.component_id),
      );

      const employee = relation
        ? employees.find(
            (item) =>
              Number(item.user_id) ===
              Number(relation.user_id),
          )
        : null;

      return {
        Data: new Date(task.start_date).toLocaleDateString(
          "pt-BR",
        ),

        Componente:
          task.component_name || "Sem nome",

        Projeto: findProjectName(task.project_id),

        Departamento: findDeptName(task.department_id),

        Responsavel:
          employee?.user_name || "Sem responsável",

        Status: task.status || "Pendente",
      };
    });
  };

  const handleDownloadPDF = () => {
    const data = getExportData();

    if (!data.length) {
      alert("Não há componentes nesta semana para exportar.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Planejamento de Produção", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `${weekDays[0].dateKey} até ${weekDays[6].dateKey}`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,

      head: [
        [
          "Data",
          "Componente",
          "Projeto",
          "Departamento",
          "Responsável",
          "Status",
        ],
      ],

      body: data.map((item) => [
        item.Data,
        item.Componente,
        item.Projeto,
        item.Departamento,
        item.Responsavel,
        item.Status,
      ]),

      styles: {
        fontSize: 8,
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [0, 82, 204],
      },
    });

    doc.save(
      `producao_${weekDays[0].dateKey.replace(/\//g, "-")}.pdf`,
    );
  };

  const handleDownloadExcel = async () => {
    const data = getExportData();

    if (!data.length) {
      alert("Não há componentes nesta semana para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Produção");

    worksheet.columns = [
      {
        header: "Data",
        key: "Data",
        width: 15,
      },
      {
        header: "Componente",
        key: "Componente",
        width: 35,
      },
      {
        header: "Projeto",
        key: "Projeto",
        width: 30,
      },
      {
        header: "Departamento",
        key: "Departamento",
        width: 25,
      },
      {
        header: "Responsável",
        key: "Responsavel",
        width: 25,
      },
      {
        header: "Status",
        key: "Status",
        width: 18,
      },
    ];

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `producao_${weekDays[0].dateKey.replace(/\//g, "-")}.xlsx`,
    );
  };

  /*
   * ==========================================================
   * ABRIR MODAL EM UM DIA ESPECÍFICO
   * ==========================================================
   */

  const openAddForDate = (dateKey = "") => {
    if (!dateKey) {
      setSelectedAddDate("");
      setIsAddOpen(true);
      return;
    }

    const [day, month, year] = dateKey.split("/");

    const isoDate = `${year}-${month}-${day}`;

    setSelectedAddDate(isoDate);
    setIsAddOpen(true);
  };

  /*
   * ==========================================================
   * COMPONENTE CRIADO
   * ==========================================================
   */

  const handleComponentCreated = async () => {
    await loadData();

    setIsAddOpen(false);
    setSelectedAddDate("");
  };

  /*
   * ==========================================================
   * COMPONENTE MOVIDO
   * ==========================================================
   */

  const handleTaskMoved = useCallback((updatedTask) => {
    setTasks((previous) =>
      previous.map((task) =>
        Number(task.component_id) ===
        Number(updatedTask.component_id)
          ? {
              ...task,
              start_date: updatedTask.start_date,
              deadline: updatedTask.deadline,
            }
          : task,
      ),
    );
  }, []);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F4F5F7] text-[#172B4D]">
      <AddComponent
        isOpen={isAddOpen}
        setOpen={setIsAddOpen}
        departmens={departments}
        projects={projects}
        equipments={equipments}
        employees={employees}
        recipes={recipes}
        initialDate={selectedAddDate}
        onCreated={handleComponentCreated}
      />

      <main className="flex h-full w-full flex-col overflow-hidden p-3 md:p-4 lg:p-5">
        {/*
         * ======================================================
         * ÚNICO CARD DO CABEÇALHO + FILTROS
         * ======================================================
         */}

        <section
          className="
            flex
            shrink-0
            flex-col
            overflow-hidden
            rounded-xl
            border
            border-[#DFE1E6]
            bg-white
            shadow-[0_1px_2px_rgba(9,30,66,0.06)]
          "
        >
          <ProductionHeader
            weekDays={weekDays}
            setIsAddOpen={openAddForDate}
            offset={offset}
            setOffset={setOffset}
            onDownloadPDF={handleDownloadPDF}
            onDownloadExcel={handleDownloadExcel}
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
        </section>

        {/*
         * ======================================================
         * CALENDÁRIO
         * ======================================================
         *
         * O calendário usa exatamente a mesma largura
         * horizontal do card acima.
         */}

        <div className="min-h-0 flex-1 overflow-hidden pt-3">
          <ProductionBoard
            weekDays={weekDays}
            tasks={tasks}
            responsible={responsible}
            setIsAddOpen={openAddForDate}
            employees={employees}
            recipes={recipes}
            selectedDept={selectedDept}
            selectedProj={selectedProj}
            selectedEmp={selectedEmp}
            onFilteredDataChange={setCurrentViewTasks}
            onTaskMoved={handleTaskMoved}
          />
        </div>
      </main>
    </div>
  );
}