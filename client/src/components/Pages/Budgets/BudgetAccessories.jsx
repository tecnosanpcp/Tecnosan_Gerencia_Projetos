import { useEffect, useState, useMemo } from "react";
import { VerifyAuth } from "@services/AuthService.js";
import { listEmployees } from "@services/EmployeesService.js";
import {
  listAccessories,
  listBudgetHistory,
  loanToBudget,
  updateBudgetLoan,
  deleteBudgetLoan,
} from "@services/AccessoriesServices.js";

import SelectMenu from "../../Ui/SelectMenu";
import { FaHistory, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

// --- Helpers ---
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(val) {
  if (!val) return "";
  return Number(val).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function isoDateToField(isoString) {
  if (!isoString) return "";
  return isoString.split("T")[0];
}

export default function BudgetAccessories({
  currentBudget,
  allBudgets = [],
  searchTerm = "",
  onRefresh,
}) {
  // --- Estados ---
  const [activeLoans, setActiveLoans] = useState([]);
  const [allAccessories, setAllAccessories] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);

  // Edição
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Adição
  const [plan, setPlan] = useState({
    accessory_id: "",
    taken_by_id: "",
    taken_at: getTodayDate(),
    received_by_id: "",
    returned_at: getTodayDate(),
  });

  // --- Carga de Dados ---
  const loadData = async () => {
    try {
      const userAuth = await VerifyAuth();

      const [loansData, accessoriesData, employeesData] = await Promise.all([
        listBudgetHistory(),
        listAccessories(),
        listEmployees(),
      ]);

      setActiveLoans(loansData || []);
      setAllAccessories(accessoriesData || []);
      setEmployeesList(employeesData || []);

      if (userAuth?.user_id) {
        const defaultUser = String(userAuth.user_id);
        setPlan((prev) => ({
          ...prev,
          taken_by_id: defaultUser,
          received_by_id: defaultUser,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBudget, onRefresh]);

  // --- Opções ---
  const accessoryOptions = useMemo(() => {
    const uniqueMap = new Map();
    allAccessories.forEach((acc) => {
      const id = String(acc.accessory_id);
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
      const empId = String(emp.user_id || emp.id);
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

    // Filtros
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.accessory_name || "").toLowerCase().includes(term) ||
          (l.taken_by_name || "").toLowerCase().includes(term) ||
          (l.budget_name || "").toLowerCase().includes(term),
      );
    }

    if (currentBudget?.id) {
      const targetId = String(currentBudget.id);
      filtered = filtered.filter((l) => String(l.budget_id) === targetId);
    }

    // Agrupa dados existentes
    filtered.forEach((loan) => {
      const groupName = loan.budget_name || "Orçamento";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(loan);
    });

    // Garante grupos vazios (Corrige o erro de unused var ao utilizar allBudgets)
    if (currentBudget?.id) {
      const name = currentBudget.name || currentBudget.budget_name;
      if (name && !groups[name]) groups[name] = [];
    } else if (allBudgets.length > 0 && !searchTerm) {
      // Se estiver vendo "Todos" e sem busca, mostra os cabeçalhos de todos os orçamentos
      allBudgets.forEach((b) => {
        const bName = b.name || b.budget_name;
        if (bName && !groups[bName]) {
          groups[bName] = [];
        }
      });
    }

    return groups;
  }, [activeLoans, searchTerm, currentBudget, allBudgets]);

  // --- Ações ---
  const handleSavePlan = async () => {
    if (!currentBudget?.id) return alert("Erro: Selecione um orçamento.");
    if (
      !plan.accessory_id ||
      !plan.taken_by_id ||
      !plan.taken_at ||
      !plan.received_by_id ||
      !plan.returned_at
    ) {
      return alert("Preencha todos os campos.");
    }
    if (new Date(plan.returned_at) < new Date(plan.taken_at)) {
      return alert("A devolução não pode ser antes da retirada.");
    }

    try {
      await loanToBudget(
        currentBudget.id,
        plan.accessory_id,
        plan.taken_by_id,
        plan.taken_at,
        plan.received_by_id,
        plan.returned_at,
      );

      setPlan((prev) => ({
        ...prev,
        accessory_id: "",
        taken_at: getTodayDate(),
        returned_at: getTodayDate(),
      }));

      refreshData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const startEditing = (loan) => {
    setEditingId(loan.movement_id);
    setEditForm({
      accessory_id: String(loan.accessory_id),
      taken_by_user_id: String(loan.taken_by_user_id),
      taken_at: isoDateToField(loan.taken_at),
      received_by_user_id: String(loan.received_by_user_id),
      returned_at: isoDateToField(loan.returned_at),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async (movementId) => {
    if (
      !editForm.accessory_id ||
      !editForm.taken_by_user_id ||
      !editForm.received_by_user_id
    )
      return alert("Preencha os campos.");

    try {
      await updateBudgetLoan(movementId, editForm);
      setEditingId(null);
      refreshData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    }
  };

  const handleDelete = async (movementId) => {
    if (window.confirm("Remover este item do planejamento?")) {
      try {
        await deleteBudgetLoan(movementId);
        refreshData();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar.");
      }
    }
  };

  const refreshData = async () => {
    const [updatedHistory] = await Promise.all([listBudgetHistory()]);
    setActiveLoans(updatedHistory || []);
  };

  // --- Render ---
  let displayGroups = Object.keys(groupedData);
  const selectedBudgetName = currentBudget?.name || currentBudget?.budget_name;

  if (currentBudget?.id && selectedBudgetName) {
    displayGroups = [selectedBudgetName];
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-4">
      {displayGroups.map((groupName) => {
        const loans = groupedData[groupName] || [];
        const isCurrentBudget = selectedBudgetName === groupName;

        return (
          <div key={groupName} className="flex flex-col gap-2">
            {!currentBudget?.id && (
              <h2 className="text-lg font-bold text-gray-700 border-l-4 border-purple-500 pl-2 mt-4">
                {groupName}
              </h2>
            )}

            <div className="overflow-visible rounded-lg border border-gray-200 shadow-sm bg-white">
              <table className="w-full project-equipments text-center text-xs">
                <thead>
                  <tr className="text-left bg-[#DBEBFF]">
                    <th className="first:rounded-tl-lg pl-2 py-2 w-[25%]">
                      Item
                    </th>
                    <th className="w-[15%]">Quem Retira</th>
                    <th className="w-[15%]">Data Retirada</th>
                    <th className="w-[15%]">Quem Devolve</th>
                    <th className="w-[15%]">Data Devolução</th>
                    <th className="last:rounded-tr-lg text-center w-[15%]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const isEditing = editingId === loan.movement_id;
                    return (
                      <tr
                        key={`plan-${loan.movement_id}`}
                        className={`border-b transition-colors ${isEditing ? "bg-orange-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <td className="pl-2 text-left py-2 font-medium text-gray-700">
                          {isEditing ? (
                            <SelectMenu
                              variant="full"
                              maxSelections={1}
                              options={accessoryOptions}
                              selectedOption={
                                editForm.accessory_id
                                  ? [editForm.accessory_id]
                                  : []
                              }
                              setSelectedOption={(val) => {
                                const id =
                                  typeof val === "function"
                                    ? val(
                                        editForm.accessory_id
                                          ? [editForm.accessory_id]
                                          : [],
                                      )[0]
                                    : val[0];
                                setEditForm((p) => ({
                                  ...p,
                                  accessory_id: id || "",
                                }));
                              }}
                              placeholder="Item..."
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <FaHistory className="text-gray-300" size={10} />
                              {loan.accessory_name}
                              {loan.serial_number && (
                                <span className="text-[9px] text-gray-400">
                                  {" "}
                                  ({loan.serial_number})
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-left p-1 text-gray-600">
                          {isEditing ? (
                            <SelectMenu
                              variant="full"
                              maxSelections={1}
                              options={employeeOptions}
                              selectedOption={
                                editForm.taken_by_user_id
                                  ? [editForm.taken_by_user_id]
                                  : []
                              }
                              setSelectedOption={(val) => {
                                const id =
                                  typeof val === "function"
                                    ? val(
                                        editForm.taken_by_user_id
                                          ? [editForm.taken_by_user_id]
                                          : [],
                                      )[0]
                                    : val[0];
                                setEditForm((p) => ({
                                  ...p,
                                  taken_by_user_id: id || "",
                                }));
                              }}
                              placeholder="Quem?"
                            />
                          ) : (
                            loan.taken_by_name
                          )}
                        </td>
                        <td className="text-left p-1 text-gray-600">
                          {isEditing ? (
                            <input
                              type="date"
                              className="bg-white border border-gray-300 rounded p-1 w-full text-xs h-[34px] focus:outline-none focus:border-purple-500"
                              value={editForm.taken_at}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  taken_at: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            formatDateTime(loan.taken_at)
                          )}
                        </td>
                        <td className="text-left p-1 text-gray-600">
                          {isEditing ? (
                            <SelectMenu
                              variant="full"
                              maxSelections={1}
                              options={employeeOptions}
                              selectedOption={
                                editForm.received_by_user_id
                                  ? [editForm.received_by_user_id]
                                  : []
                              }
                              setSelectedOption={(val) => {
                                const id =
                                  typeof val === "function"
                                    ? val(
                                        editForm.received_by_user_id
                                          ? [editForm.received_by_user_id]
                                          : [],
                                      )[0]
                                    : val[0];
                                setEditForm((p) => ({
                                  ...p,
                                  received_by_user_id: id || "",
                                }));
                              }}
                              placeholder="Quem?"
                            />
                          ) : (
                            loan.received_by_name
                          )}
                        </td>
                        <td className="text-left p-1 text-gray-600">
                          {isEditing ? (
                            <input
                              type="date"
                              className="bg-white border border-gray-300 rounded p-1 w-full text-xs h-[34px] focus:outline-none focus:border-purple-500"
                              value={editForm.returned_at}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  returned_at: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            formatDateTime(loan.returned_at)
                          )}
                        </td>
                        <td className="text-center p-1">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleUpdate(loan.movement_id)}
                                className="text-green-600 bg-green-50 p-1 rounded"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-red-500 bg-red-50 p-1 rounded"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          ) : (
                            isCurrentBudget && (
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => startEditing(loan)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(loan.movement_id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {isCurrentBudget && !editingId && (
                    <tr className="bg-purple-50 border-t-2 border-purple-100">
                      <td className="pl-2 py-2 text-left">
                        <SelectMenu
                          variant="full"
                          maxSelections={1}
                          options={accessoryOptions}
                          selectedOption={
                            plan.accessory_id ? [plan.accessory_id] : []
                          }
                          setSelectedOption={(val) => {
                            const id =
                              typeof val === "function"
                                ? val(
                                    plan.accessory_id
                                      ? [plan.accessory_id]
                                      : [],
                                  )[0]
                                : val[0];
                            setPlan((p) => ({ ...p, accessory_id: id || "" }));
                          }}
                          placeholder="Item..."
                        />
                      </td>
                      <td className="text-left p-1">
                        <SelectMenu
                          variant="full"
                          maxSelections={1}
                          options={employeeOptions}
                          selectedOption={
                            plan.taken_by_id ? [plan.taken_by_id] : []
                          }
                          setSelectedOption={(val) => {
                            const id =
                              typeof val === "function"
                                ? val(
                                    plan.taken_by_id ? [plan.taken_by_id] : [],
                                  )[0]
                                : val[0];
                            setPlan((p) => ({ ...p, taken_by_id: id || "" }));
                          }}
                          placeholder="Quem?"
                        />
                      </td>
                      <td className="text-left p-1">
                        <input
                          type="date"
                          className="bg-white border border-gray-300 rounded p-1 w-full text-xs h-[34px] focus:outline-none focus:border-purple-500"
                          value={plan.taken_at}
                          onChange={(e) =>
                            setPlan((p) => ({ ...p, taken_at: e.target.value }))
                          }
                        />
                      </td>
                      <td className="text-left p-1">
                        <SelectMenu
                          variant="full"
                          maxSelections={1}
                          options={employeeOptions}
                          selectedOption={
                            plan.received_by_id ? [plan.received_by_id] : []
                          }
                          setSelectedOption={(val) => {
                            const id =
                              typeof val === "function"
                                ? val(
                                    plan.received_by_id
                                      ? [plan.received_by_id]
                                      : [],
                                  )[0]
                                : val[0];
                            setPlan((p) => ({
                              ...p,
                              received_by_id: id || "",
                            }));
                          }}
                          placeholder="Quem?"
                        />
                      </td>
                      <td className="text-left p-1">
                        <input
                          type="date"
                          className="bg-white border border-gray-300 rounded p-1 w-full text-xs h-[34px] focus:outline-none focus:border-purple-500"
                          value={plan.returned_at}
                          onChange={(e) =>
                            setPlan((p) => ({
                              ...p,
                              returned_at: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td className="text-center p-1">
                        <button
                          onClick={handleSavePlan}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase px-3 py-2 rounded w-full"
                        >
                          Salvar
                        </button>
                      </td>
                    </tr>
                  )}

                  {loans.length === 0 && !isCurrentBudget && (
                    <tr className="bg-white">
                      <td
                        colSpan="6"
                        className="p-4 text-center text-gray-400 text-xs italic"
                      >
                        Nenhum planejamento encontrado.
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
        <div className="text-center text-gray-500 mt-10 p-4 border border-dashed rounded bg-gray-50">
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
}
