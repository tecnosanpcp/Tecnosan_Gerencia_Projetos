import { useState, useEffect } from "react";
import NavBar from "../../Ui/NavBar";
import AddComponent from "../../Ui/AddComponent";

// Bibliotecas de Exportação
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
import { getComponentRecipe } from "@services/ComponentRecipes.js"
import { getEmployeesComponents } from "@services/EmployeesComponentsServices.js"

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
      dateObj: day,
      dateKey: day.toLocaleDateString("pt-BR"),
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
  const [recipes, setRecipes] = useState([])

  const [tasks, setTasks] = useState([]);
  const [responsible, setReponsible] = useState([])

  // Estado para armazenar o que o usuário está vendo no Board (filtrado por Depto/Proj/Func)
  const [currentViewTasks, setCurrentViewTasks] = useState([]);

  // --- Semana ---
  const weekDays = generateWeek(offset);

  // --- Fetch Data ---
  useEffect(() => {
    async function loadData() {
      try {
        const user = await VerifyAuth();

        const [deptData, empData, projData, compData, equipData, recipesData, emplCompData] =
          await Promise.all([
            listDepartments(),
            listEmployees(),
            listProjects(user.user_id),
            getComponents(),
            listEquipments(),
            getComponentRecipe(),
            getEmployeesComponents()
          ]);

        if (deptData) setDepartments(deptData);
        if (empData) setEmployees(empData);
        if (projData) setProjects(projData);
        if (compData) setTasks(compData);
        if (equipData) setEquipments(equipData);
        if(recipesData) setRecipes(recipesData)
        if(emplCompData) setReponsible(emplCompData)
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    }

    loadData();
  }, []);

  // --- Helpers para pegar nomes baseados nos IDs ---
  const findProjectName = (id) => projects.find(p => p.project_id === id)?.project_name || "N/A";
  const findDeptName = (id) => departments.find(d => d.department_id === id)?.department_name || "N/A";

  // --- PREPARAÇÃO DOS DADOS PARA EXPORTAÇÃO ---
  const getExportData = () => {
    // 1. Cria um conjunto com as datas que estão visíveis na tela (a semana atual)
    const weekDatesSet = new Set(weekDays.map(d => d.dateKey));

    // 2. Filtra a lista de tarefas:
    //    Mantém apenas tarefas cuja data de início esteja dentro da semana atual
    const tasksInCurrentWeek = currentViewTasks.filter(task => {
      if (!task.start_date) return false;
      
      const taskDateKey = new Date(task.start_date).toLocaleDateString("pt-BR");
      return weekDatesSet.has(taskDateKey);
    });

    // 3. Formata os dados filtrados para ficarem bonitos no Excel/PDF
    return tasksInCurrentWeek.map(task => {
        const resp = responsible.find(r => r.component_id === task.component_id);
        const respName = resp 
            ? employees.find(e => e.user_id === resp.user_id)?.user_name 
            : "Sem responsável";

        return {
            Data: new Date(task.start_date).toLocaleDateString("pt-BR"),
            Componente: task.component_name || "Sem nome",
            Projeto: findProjectName(task.project_id),
            Departamento: findDeptName(task.department_id),
            Status: task.status || "Pendente",
            Responsavel: respName
        };
    });
  };

  // --- DOWNLOAD PDF ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = getExportData();
    
    // Se não tiver dados na semana, avisa e para
    if (tableData.length === 0) {
      alert("Não há dados para exportar nesta semana.");
      return;
    }

    const tableRows = tableData.map(item => [
      item.Data,
      item.Componente,
      item.Projeto,
      item.Departamento,
      item.Responsavel,
      item.Status
    ]);

    doc.text(`Planejamento Semanal - ${weekDays[0].formatted} a ${weekDays[6].formatted}`, 14, 15);
    
    autoTable(doc, {
      head: [['Data', 'Componente', 'Projeto', 'Depto', 'Responsável', 'Status']],
      body: tableRows,
      startY: 20,
    });

    doc.save(`planejamento_${weekDays[0].dateKey.replace(/\//g, '-')}.pdf`);
  };

  // --- DOWNLOAD EXCEL (Usando ExcelJS) ---
  const handleDownloadExcel = async () => {
    const data = getExportData();
    
    if (data.length === 0) {
      alert("Não há dados para exportar nesta semana.");
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Planejamento");

    worksheet.columns = [
      { header: "Data", key: "Data", width: 15 },
      { header: "Componente", key: "Componente", width: 30 },
      { header: "Projeto", key: "Projeto", width: 25 },
      { header: "Departamento", key: "Departamento", width: 20 },
      { header: "Responsável", key: "Responsavel", width: 25 },
      { header: "Status", key: "Status", width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `planejamento_${weekDays[0].dateKey.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <>
      <AddComponent
        isOpen={isAddOpen}
        setOpen={setIsAddOpen}
        departmens={departments}
        projects={projects}
        equipments={equipments}
        employees={employees}
        recipes={recipes}
      />

      <div className="bg-slate-200 flex flex-col space-y-5 rounded-lg p-0 m-0 min-h-screen">
        <NavBar select_index={2} />

        <ProductionHeader
          weekDays={weekDays}
          setIsAddOpen={setIsAddOpen}
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

        <ProductionBoard
          weekDays={weekDays}
          tasks={tasks}
          responsible={responsible}
          setIsAddOpen={setIsAddOpen}
          employees={employees}
          recipes={recipes}
          selectedDept={selectedDept}
          selectedProj={selectedProj}
          selectedEmp={selectedEmp}
          onFilteredDataChange={setCurrentViewTasks}
        />
      </div>
    </>
  );
}