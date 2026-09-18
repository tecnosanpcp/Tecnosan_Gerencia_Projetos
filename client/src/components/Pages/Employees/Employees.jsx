import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiUsers, FiBriefcase } from "react-icons/fi";

import EmployeeFramework from "./EmployeeFramework";
import RegisterEmployeeModal from "./RegisterEmployeeModal";
import DepartmentCard from "./DepartmentCard";
import DepartmentModalRegister from "./DepartmentModalRegister";

import { listEmployees } from "@services/EmployeesService";
import { listDepartments } from "@services/DepartmentService";

export default function Employees() {
  const [isAddEmployeeModal, setAddEmployeeModal] = useState(false);
  const [isAddDepModal, setAddDepModal] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await listEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Falha ao buscar funcionários:", error);
      setEmployees([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await listDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Falha ao buscar departamentos:", error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();

    if (!term) return employees;

    return employees.filter((employee) =>
      JSON.stringify(employee).toLowerCase().includes(term)
    );
  }, [employees, employeeSearch]);

  const filteredDepartments = useMemo(() => {
    const term = departmentSearch.trim().toLowerCase();

    if (!term) return departments;

    return departments.filter((department) =>
      JSON.stringify(department).toLowerCase().includes(term)
    );
  }, [departments, departmentSearch]);

  const refreshEmployees = async () => {
    await fetchEmployees();
  };

  return (
    <>
      <RegisterEmployeeModal
        visible={isAddEmployeeModal}
        setVisible={setAddEmployeeModal}
        onEmployeeChanged={refreshEmployees}
      />

      <DepartmentModalRegister
        visible={isAddDepModal}
        setVisible={setAddDepModal}
      />

      <main className="min-h-screen w-full bg-[#F4F5F7] font-sans text-[#172B4D] overflow-x-hidden">
        <div className="w-full px-4 py-4 sm:px-5 lg:px-6 xl:px-8">
          {/* HEADER */}
          <section className="mb-4 rounded-lg border border-[#DFE1E6] bg-white shadow-sm">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DEEBFF] text-[#0052CC]">
                  <FiUsers size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-[20px] font-semibold leading-6 text-[#172B4D]">
                    Colaboradores
                  </h1>

                  <p className="mt-0.5 text-[12px] text-[#5E6C84]">
                    Gerencie colaboradores e departamentos do sistema.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAddEmployeeModal(true)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0052CC] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0065FF] active:scale-[0.98]"
              >
                <FiPlus size={16} />
                Adicionar colaborador
              </button>
            </div>
          </section>

          {/* CONTEÚDO */}
          <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* COLABORADORES */}
            <section className="min-w-0 rounded-lg border border-[#DFE1E6] bg-white shadow-sm">
              {/* título + busca */}
              <div className="flex flex-col gap-3 border-b border-[#DFE1E6] px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FiUsers
                      size={17}
                      className="text-[#0052CC]"
                    />

                    <h2 className="text-[15px] font-semibold text-[#172B4D]">
                      Colaboradores
                    </h2>

                    <span className="rounded-full bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-semibold text-[#5E6C84]">
                      {filteredEmployees.length}
                    </span>
                  </div>

                  
                </div>

                <div className="relative w-full md:w-[280px]">
                  <FiSearch
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]"
                  />

                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(event) =>
                      setEmployeeSearch(event.target.value)
                    }
                    placeholder="Pesquisar colaborador..."
                    className="h-9 w-full rounded-md border border-[#DFE1E6] bg-white pl-9 pr-3 text-[12px] text-[#172B4D] outline-none transition placeholder:text-[#97A0AF] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]"
                  />
                </div>
              </div>

              {/* lista */}
              <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4">
                {filteredEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                      <EmployeeFramework
                        key={employee.user_id}
                        user_id={employee.user_id}
                        employee_name={employee.user_name}
                        employee_office={employee.job_title}
                        employee_pay={employee.salary}
                        employee_absences={0}
                        employee_overtime={0}
                        employee_performance={employee.performance}
                        onEmployeeChanged={refreshEmployees}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-[#FAFBFC] px-6 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F5F7] text-[#6B778C]">
                      <FiUsers size={20} />
                    </div>

                    <h3 className="text-[14px] font-semibold text-[#172B4D]">
                      Nenhum colaborador encontrado
                    </h3>

                    <p className="mt-1 max-w-sm text-[12px] text-[#6B778C]">
                      {employeeSearch
                        ? "Tente pesquisar utilizando outro nome, cargo ou informação."
                        : "Ainda não existem colaboradores cadastrados."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* DEPARTAMENTOS */}
            <aside className="min-w-0 rounded-lg border border-[#DFE1E6] bg-white shadow-sm">
              <div className="border-b border-[#DFE1E6] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FiBriefcase
                        size={17}
                        className="text-[#6554C0]"
                      />

                      <h2 className="text-[15px] font-semibold text-[#172B4D]">
                        Departamentos
                      </h2>

                      <span className="rounded-full bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-semibold text-[#5E6C84]">
                        {filteredDepartments.length}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-[#6B778C]">
                      Áreas cadastradas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddDepModal(true)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#DFE1E6] text-[#0052CC] transition hover:border-[#B3D4FF] hover:bg-[#DEEBFF]"
                    title="Adicionar departamento"
                  >
                    <FiPlus size={17} />
                  </button>
                </div>

                <div className="relative mt-3">
                  <FiSearch
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]"
                  />

                  <input
                    type="text"
                    value={departmentSearch}
                    onChange={(event) =>
                      setDepartmentSearch(event.target.value)
                    }
                    placeholder="Pesquisar departamento..."
                    className="h-9 w-full rounded-md border border-[#DFE1E6] bg-white pl-9 pr-3 text-[12px] text-[#172B4D] outline-none transition placeholder:text-[#97A0AF] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]"
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-3">
                <div className="flex flex-col gap-2">
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map((department) => (
                      <DepartmentCard
                        key={department.department_id}
                        id={department.department_id}
                        name={department.department_name}
                      />
                    ))
                  ) : (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-[#FAFBFC] px-5 text-center">
                      <FiBriefcase
                        size={20}
                        className="mb-2 text-[#97A0AF]"
                      />

                      <p className="text-[13px] font-semibold text-[#172B4D]">
                        Nenhum departamento
                      </p>

                      <p className="mt-1 text-[11px] text-[#6B778C]">
                        Nenhum resultado encontrado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}