import { CiFilter } from "react-icons/ci";
import { LuFolderKanban } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import SelectMenu from "../../Ui/SelectMenu";

export default function ProductionFilters({
  departments,
  selectedDept,
  setSelectedDept,
  projects,
  selectedProj,
  setSelectedProj,
  employees,
  selectedEmp,
  setSelectedEmp,
}) {
  return (
    <div className="card rounded-md flex flex-wrap space-x-2">
      <div className="flex flex-row items-center space-x-2">
        <CiFilter className="h-5 w-5" />
        <p>Departamento:</p>
        <SelectMenu
          options={departments.map((dep) => ({ id: dep.departament_id, label: dep.department_name }))}
          selectedOption={selectedDept}
          setSelectedOption={setSelectedDept}
        />
      </div>

      <div className="flex flex-row items-center space-x-2">
        <LuFolderKanban className="h-5 w-5" />
        <p>Projetos:</p>
        <SelectMenu
          options={projects.map((proj) => ({ id: proj.project_id, label: proj.project_name }))}
          selectedOption={selectedProj}
          setSelectedOption={setSelectedProj}
        />
      </div>

      <div className="flex flex-row items-center space-x-2">
        <FiUser className="h-5 w-5" />
        <p>Funcionário:</p>
        <SelectMenu
          options={employees.map((emp) => ({ id: emp.user_id, label: emp.user_name }))}
          selectedOption={selectedEmp}
          setSelectedOption={setSelectedEmp}
        />
      </div>
    </div>
  );
}