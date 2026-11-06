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
    <div
      className="
        flex
        w-full
        flex-wrap
        items-center
        gap-x-5
        gap-y-2
        px-4
        pb-3
      "
    >
      {/* =====================================================
          DEPARTAMENTO
          ===================================================== */}

      <div className="flex min-w-0 items-center gap-2">
        <CiFilter className="h-5 w-5 shrink-0 text-[#5E6C84]" />

        <span className="whitespace-nowrap text-sm font-medium text-[#5E6C84]">
          Departamento:
        </span>

        <SelectMenu
          options={departments.map((dep) => ({
            id: dep.department_id,
            label: dep.department_name,
          }))}
          selectedOption={selectedDept}
          setSelectedOption={setSelectedDept}
          maxSelections={1}
        />
      </div>

      {/* =====================================================
          PROJETO
          ===================================================== */}

      <div className="flex min-w-0 items-center gap-2">
        <LuFolderKanban className="h-4 w-4 shrink-0 text-[#5E6C84]" />

        <span className="whitespace-nowrap text-sm font-medium text-[#5E6C84]">
          Projeto:
        </span>

        <SelectMenu
          options={projects.map((proj) => ({
            id: proj.project_id,
            label: proj.project_name,
          }))}
          selectedOption={selectedProj}
          setSelectedOption={setSelectedProj}
        />
      </div>

      {/* =====================================================
          FUNCIONÁRIO
          ===================================================== */}

      <div className="flex min-w-0 items-center gap-2">
        <FiUser className="h-4 w-4 shrink-0 text-[#5E6C84]" />

        <span className="whitespace-nowrap text-sm font-medium text-[#5E6C84]">
          Funcionário:
        </span>

        <SelectMenu
          options={employees.map((emp) => ({
            id: emp.user_id,
            label: emp.user_name,
          }))}
          selectedOption={selectedEmp}
          setSelectedOption={setSelectedEmp}
        />
      </div>
    </div>
  );
}