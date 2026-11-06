import { IoMdClose } from "react-icons/io";
import {
  FiUser,
  FiEdit3,
  FiMail,
  FiLock,
  FiBriefcase,
  FiDollarSign,
} from "react-icons/fi";
import { useEffect, useState } from "react";

import { listDepartments } from "@services/DepartmentService";
import { editEmployee } from "@services/EmployeesService";

import SelectMenu from "../../Ui/SelectMenu";

export default function EditEmployeeModal({
  visible,
  setVisible,
  user_id,
}) {
  const [employee_name, setEmployeeName] = useState("");
  const [job_title, setJobTitle] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [pay, setPay] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await listDepartments();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, [user_id]);

  const handleUptadeEmployee = async () => {
    try {
      await editEmployee(
        user_id,
        email,
        employee_name,
        password,
        3,
        pay,
        1,
        job_title,
        1
      );

      alert("Funcionário atualizado com sucesso!");
      setVisible(false);
      window.location.reload();
    } catch (error) {
      console.error("erro ao atualizar dados", error);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setVisible(false);
        }
      }}
    >
      <div className="flex max-h-[calc(100vh-48px)] w-full max-w-[720px] flex-col overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleUptadeEmployee(user_id);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
              event.preventDefault();
              event.currentTarget.requestSubmit();
            }
          }}
          className="flex min-h-0 flex-col"
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DEEBFF] text-[#0052CC]">
                <FiEdit3 size={18} />
              </div>

              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold text-[#172B4D]">
                  Editar funcionário
                </h2>

                <p className="mt-0.5 text-[11px] text-[#6B778C]">
                  Atualize as informações do colaborador.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6B778C] transition hover:bg-[#F4F5F7] hover:text-[#172B4D]"
              aria-label="Fechar"
            >
              <IoMdClose size={19} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="min-h-0 overflow-y-auto px-5 py-5">
            <div className="space-y-5">
              <section>
                <div className="mb-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                    Dados do funcionário
                  </p>

                  <div className="mt-2 h-px bg-[#F4F5F7]" />
                </div>

                <div className="space-y-4">
                  <Field
                    icon={<FiUser size={15} />}
                    label="Nome completo"
                    required
                  >
                    <input
                      type="text"
                      name="user_name"
                      placeholder="Digite o nome completo"
                      value={employee_name}
                      onChange={(event) =>
                        setEmployeeName(event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      icon={<FiMail size={15} />}
                      label="Email"
                      required
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="Digite o email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        required
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      icon={<FiLock size={15} />}
                      label="Senha"
                      required
                    >
                      <input
                        type="password"
                        name="pass"
                        placeholder="Digite a senha"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        required
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                    Dados profissionais
                  </p>

                  <div className="mt-2 h-px bg-[#F4F5F7]" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    icon={<FiBriefcase size={15} />}
                    label="Cargo"
                    required
                  >
                    <input
                      type="text"
                      name="job-title"
                      placeholder="Digite o cargo"
                      value={job_title}
                      onChange={(event) =>
                        setJobTitle(event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    icon={<FiBriefcase size={15} />}
                    label="Departamento"
                    required
                  >
                    <SelectMenu
                      variant="full"
                      options={departments.map((dep) => ({
                        id: dep.department_id,
                        label: dep.department_name,
                      }))}
                      maxSelections={1}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                    />
                  </Field>

                  <Field
                    icon={<FiDollarSign size={15} />}
                    label="Salário"
                    required
                  >
                    <input
                      type="text"
                      name="salary"
                      placeholder="Digite o salário"
                      value={pay}
                      onChange={(event) =>
                        setPay(event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="h-9 rounded-md border border-[#DFE1E6] bg-white px-4 text-[12px] font-semibold text-[#172B4D] transition hover:bg-[#F4F5F7]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-9 rounded-md bg-[#0052CC] px-5 text-[12px] font-semibold text-white transition hover:bg-[#0065FF] active:scale-[0.98]"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-md border border-[#DFE1E6] bg-white px-3 text-[12px] text-[#172B4D] outline-none transition placeholder:text-[#97A0AF] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]";

function Field({ icon, label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#172B4D]">
        <span className="text-[#6B778C]">{icon}</span>
        {label}
        {required && <span className="text-[#DE350B]">*</span>}
      </label>

      {children}
    </div>
  );
}