import { useEffect, useState, useContext, useMemo } from "react";
import { selectedProjectContext } from "@content/SeletedProject.jsx";
import { VerifyAuth } from "@services/AuthService.js";
import { listEmployees } from "@services/EmployeesService.js";
import {
  listAccessories,
  listActiveLoans,
  loanToProject,
  returnAccessory,
} from "@services/AccessoriesServices.js";

import SelectMenu from "../../Ui/SelectMenu";
import { FaCheck, FaTimes, FaHistory } from "react-icons/fa";

// --- Helpers ---
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatCurrency(val) {
  if (!val) return "";
  return Number(val).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function ProjectAccessoriesTable({ searchTerm, onRefresh }) {
  // --- Estados ---
  const [activeLoans, setActiveLoans] = useState([]);
  const [allAccessories, setAllAccessories] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Form Adicionar
  const [newLoan, setNewLoan] = useState({
    accessory_id: "",
    user_id: "",
    taken_at: getTodayDate(),
  });

  // Form Devolver (Inline)
  const [returningId, setReturningId] = useState(null);
  const [returnForm, setReturnForm] = useState({
    received_by: "",
    returned_at: getTodayDate(),
  });

  const { currentProject } = useContext(selectedProjectContext);

  // --- Carga de Dados ---
  const loadData = async () => {
    try {
      const userAuth = await VerifyAuth();
      setCurrentUser(userAuth);

      const [loansData, accessoriesData, employeesData] = await Promise.all([
        listActiveLoans(), // Traz histórico completo
        listAccessories(),
        listEmployees(),
      ]);

      setActiveLoans(loansData || []);
      setAllAccessories(accessoriesData || []);
      setEmployeesList(employeesData || []);

      if (userAuth?.user_id) {
        setNewLoan((prev) => ({ ...prev, user_id: userAuth.user_id }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [onRefresh]);

  // --- Opções ---
  const accessoryOptions = useMemo(() => {
    const uniqueMap = new Map();
    allAccessories.forEach((acc) => {
      if (acc.status !== "Available") return;
      const id = acc.accessory_id;
      const labelParts = [acc.name];
      if (acc.serial_number) labelParts.push(`(S/N: ${acc.serial_number})`);
      if (acc.value) labelParts.push(`- ${formatCurrency(acc.value)}`);
      if (id) uniqueMap.set(id, { id, label: labelParts.join(" ") });
    });
    return Array.from(uniqueMap.values());
  }, [allAccessories]);

  const employeeOptions = useMemo(() => {
    const uniqueMap = new Map();
    employeesList.forEach((emp) => {
      const empId = emp.user_id || emp.id;
      const label =
        emp.name || emp.user_name || emp.employee_name || "Colaborador";
      if (empId) uniqueMap.set(empId, { id: empId, label });
    });
    return Array.from(uniqueMap.values());
  }, [employeesList]);

  // --- Agrupamento ---
  const groupedData = useMemo(() => {
    const groups = {};
    let filtered = activeLoans;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.accessory || "").toLowerCase().includes(term) ||
          (l.taken_by || "").toLowerCase().includes(term) ||
          (l.context_name || "").toLowerCase().includes(term),
      );
    }

    if (currentProject?.id) {
      const targetName = (
        currentProject.project_name ||
        currentProject.name ||
        ""
      ).trim();
      filtered = filtered.filter((l) => l.context_name === targetName);
    }

    filtered.forEach((loan) => {
      const groupName = loan.context_name || "Sem Projeto";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(loan);
    });

    return groups;
  }, [activeLoans, searchTerm, currentProject]);

  // --- Ações ---
  const handleSaveLoan = async () => {
    if (!currentProject?.id) return alert("Selecione um projeto.");
    if (!newLoan.accessory_id) return alert("Selecione um acessório.");
    if (!newLoan.user_id) return alert("Selecione o responsável.");

    try {
      await loanToProject(
        currentProject.id,
        newLoan.accessory_id,
        newLoan.user_id,
        newLoan.taken_at,
      );
      setNewLoan({
        accessory_id: "",
        user_id: currentUser?.user_id || "",
        taken_at: getTodayDate(),
      });
      await loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const confirmReturn = async (movementId) => {
    if (!returnForm.received_by) return alert("Informe quem recebeu.");
    if (!returnForm.returned_at) return alert("Informe a data.");

    try {
      await returnAccessory(
        movementId,
        returnForm.received_by,
        returnForm.returned_at,
        "project",
      );
      setReturningId(null);
      await loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao devolver.");
    }
  };

  // --- Render ---
  let displayGroups = Object.keys(groupedData);
  const selectedProjectName =
    currentProject?.project_name || currentProject?.name;

  if (currentProject?.id && selectedProjectName) {
    if (!displayGroups.includes(selectedProjectName))
      displayGroups = [selectedProjectName];
    else displayGroups = [selectedProjectName];
  }

  return (
    <div className="flex flex-col w-full">
      {displayGroups.map((projName) => {
        const loans = groupedData[projName] || [];
        const isCurrentProject = selectedProjectName === projName;

        return (
          <div key={projName} className="flex flex-col ">
            {!currentProject?.id && (
              <div className="flex items-center border-t border-b border-[#B3D4FF] bg-[#E9F2FF] px-3 py-1">
                <h2 className="m-0 text-[12px] font-semibold text-[#172B4D]">
                  {projName}
                </h2>
              </div>
            )}

            <div className="overflow-visible border border-[#DFE1E6] bg-white">
              <table className="w-full project-equipments text-center text-xs">
                <thead className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                  <tr>
                    <th className="w-1/4 px-3 py-1 text-left text-[8px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Acessório
                    </th>

                    <th className="w-1/4 px-3 py-1 text-left text-[8px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Movimentação
                    </th>

                    <th className="w-1/4 px-3 py-1 text-left text-[8px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Datas
                    </th>

                    <th className="w-24 px-3 py-1 text-center text-[8px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const isReturning = returningId === loan.movement_id;
                    const isReturned = !!loan.returned_at; // Lógica para saber se é histórico

                    // Se já foi devolvido, fica cinza
                    const rowClass = isReturned
                      ? "bg-gray-100 text-gray-500 border-b border-gray-200"
                      : isReturning
                        ? "bg-orange-50 border-b border-gray-300"
                        : "bg-white border-b border-gray-300 hover:bg-blue-50";

                    return (
                      <tr
                        key={`${loan.type || "L"}-${loan.movement_id}`}
                        className={`transition-colors last:border-0 ${rowClass}`}
                      >
                        {/* 1. ACESSÓRIO */}
                        <td className="px-3 py-1 text-left text-[11px] font-medium text-[#172B4D]">
                          <div className="flex items-center gap-2">
                            {isReturned && (
                              <FaHistory className="text-gray-400" />
                            )}
                            {loan.accessory}
                          </div>
                        </td>

                        {/* 2. RESPONSÁVEIS */}
                        <td className="px-3 py-1 text-left">
                          {isReturning ? (
                            <SelectMenu
                              variant="full"
                              maxSelections={1}
                              options={employeeOptions}
                              selectedOption={
                                returnForm.received_by
                                  ? [returnForm.received_by]
                                  : []
                              }
                              setSelectedOption={(action) => {
                                setReturnForm((prev) => {
                                  const cur = prev.received_by
                                    ? [prev.received_by]
                                    : [];
                                  const nxt =
                                    typeof action === "function"
                                      ? action(cur)
                                      : action;
                                  return { ...prev, received_by: nxt[0] || "" };
                                });
                              }}
                            />
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1">
                                <span className="font-bold text-[9px] uppercase text-gray-400 border border-gray-200 px-1 rounded">
                                  Pegou
                                </span>
                                {loan.taken_by}
                              </span>
                              {isReturned && loan.received_by && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <span className="font-bold text-[9px] uppercase text-gray-300 border border-gray-200 px-1 rounded">
                                    Devolveu
                                  </span>
                                  {loan.received_by}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 3. DATAS */}
                        <td className="px-3 py-1.5 text-left">
                          {isReturning ? (
                            <input
                              type="date"
                              className="bg-white border border-gray-300 rounded p-1 w-full text-xs focus:outline-none focus:border-blue-500 h-[34px]"
                              value={returnForm.returned_at}
                              onChange={(e) =>
                                setReturnForm({
                                  ...returnForm,
                                  returned_at: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1">
                                <span className="font-bold text-[9px] uppercase text-gray-400 border border-gray-200 px-1 rounded">
                                  Saída
                                </span>
                                {formatDateTime(loan.taken_at)}
                              </span>
                              {isReturned && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <span className="font-bold text-[9px] uppercase text-gray-300 border border-gray-200 px-1 rounded">
                                    Retorno
                                  </span>
                                  {formatDateTime(loan.returned_at)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 4. AÇÕES */}
                        <td className="px-3 py-1.5 text-center">
                          {isReturned ? (
                            <span className="rounded-md bg-[#EBECF0] px-2 py-1 text-[10px] font-medium text-[#6B778C]">
                              Devolvido
                            </span>
                          ) : isReturning ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => confirmReturn(loan.movement_id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <FaCheck size={16} />
                              </button>
                              <button
                                onClick={() => setReturningId(null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReturningId(loan.movement_id);
                                setReturnForm({
                                  received_by: currentUser?.user_id || "",
                                  returned_at: getTodayDate(),
                                });
                              }}
                              className="
                                rounded-md
                                px-2 py-1
                                text-[10px]
                                font-medium
                                text-[#DE350B]
                                transition
                                hover:bg-[#FFEBE6]
                              "
                            >
                              Devolver
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* ADICIONAR (Footer) */}
                  {isCurrentProject && !returningId && (
                    <tr className="border-t border-[#B3D4FF] bg-[#E9F2FF]">
                      <td className="pl-2 py-2 text-left">
                        <SelectMenu
                          variant="full"
                          maxSelections={1}
                          options={accessoryOptions}
                          selectedOption={
                            newLoan.accessory_id ? [newLoan.accessory_id] : []
                          }
                          setSelectedOption={(action) => {
                            setNewLoan((prev) => {
                              const cur = prev.accessory_id
                                ? [prev.accessory_id]
                                : [];
                              const nxt =
                                typeof action === "function"
                                  ? action(cur)
                                  : action;
                              return { ...prev, accessory_id: nxt[0] || "" };
                            });
                          }}
                        />
                      </td>

                      <td className="text-left p-2">
                        <SelectMenu
                          variant="full"
                          maxSelections={1}
                          options={employeeOptions}
                          selectedOption={
                            newLoan.user_id ? [newLoan.user_id] : []
                          }
                          setSelectedOption={(action) => {
                            setNewLoan((prev) => {
                              const cur = prev.user_id ? [prev.user_id] : [];
                              const nxt =
                                typeof action === "function"
                                  ? action(cur)
                                  : action;
                              return { ...prev, user_id: nxt[0] || "" };
                            });
                          }}
                        />
                      </td>

                      <td className="text-left pr-2">
                        <input
                          type="date"
                          className="
                            h-8 w-full rounded-md
                            border border-[#DFE1E6]
                            bg-white px-2
                            text-[11px] text-[#172B4D]
                            outline-none
                            focus:border-[#4C9AFF]
                            focus:ring-2
                            focus:ring-[#DEEBFF]
                          "
                          value={newLoan.taken_at}
                          onChange={(e) =>
                            setNewLoan({ ...newLoan, taken_at: e.target.value })
                          }
                        />
                      </td>

                      <td className="text-center">
                        <button
                          onClick={handleSaveLoan}
                          className="text-green-600 hover:text-green-800 font-bold text-xs uppercase border border-green-600 hover:bg-green-50 px-2 py-1 rounded transition-all"
                        >
                          Salvar
                        </button>
                      </td>
                    </tr>
                  )}

                  {loans.length === 0 && !isCurrentProject && (
                    <tr className="bg-white">
                      <td
                        colSpan="4"
                        className="p-4 text-center text-gray-400 text-xs italic"
                      >
                        Nenhum acessório alocado neste projeto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {displayGroups.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          Nenhum projeto selecionado ou encontrado.
        </div>
      )}
    </div>
  );
}
