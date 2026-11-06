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
  return new Date().toLocaleDateString("en-CA");
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
  const [activeLoans, setActiveLoans] = useState([]);
  const [allAccessories, setAllAccessories] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState([]);

  const [plan, setPlan] = useState({
    accessory_id: "",
    taken_by_id: "",
    taken_at: getTodayDate(),
    received_by_id: "",
    returned_at: "",
  });

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
          received_by_id: "",
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBudget, onRefresh]);

  const accessoryOptions = useMemo(() => {
    const uniqueMap = new Map();

    allAccessories.forEach((acc) => {
      const id = String(acc.accessory_id);

      const labelParts = [acc.name];

      if (acc.serial_number) {
        labelParts.push(`(S/N: ${acc.serial_number})`);
      }

      if (acc.value) {
        labelParts.push(`- ${formatCurrency(acc.value)}`);
      }

      if (id) {
        uniqueMap.set(id, {
          id,
          label: labelParts.join(" "),
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, [allAccessories]);

  const employeeOptions = useMemo(() => {
    const uniqueMap = new Map();

    employeesList.forEach((emp) => {
      const empId = String(emp.user_id || emp.id);

      const label =
        emp.name || emp.user_name || emp.employee_name || "Colaborador";

      if (empId) {
        uniqueMap.set(empId, {
          id: empId,
          label,
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, [employeesList]);

  const groupedData = useMemo(() => {
    const groups = {};
    let filtered = activeLoans;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (loan) =>
          (loan.accessory_name || "").toLowerCase().includes(term) ||
          (loan.taken_by_name || "").toLowerCase().includes(term) ||
          (loan.budget_name || "").toLowerCase().includes(term),
      );
    }

    if (currentBudget?.id) {
      const targetId = String(currentBudget.id);

      filtered = filtered.filter((loan) => String(loan.budget_id) === targetId);
    }

    filtered.forEach((loan) => {
      const groupName = loan.budget_name || "Orçamento";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(loan);
    });

    if (currentBudget?.id) {
      const name = currentBudget.name || currentBudget.budget_name;

      if (name && !groups[name]) {
        groups[name] = [];
      }
    } else if (allBudgets.length > 0 && !searchTerm) {
      allBudgets.forEach((budget) => {
        const budgetName = budget.name || budget.budget_name;

        if (budgetName && !groups[budgetName]) {
          groups[budgetName] = [];
        }
      });
    }

    return groups;
  }, [activeLoans, searchTerm, currentBudget, allBudgets]);

  const refreshData = async () => {
    const [updatedHistory] = await Promise.all([listBudgetHistory()]);

    setActiveLoans(updatedHistory || []);
  };

  const handleSavePlan = async () => {
    if (!currentBudget?.id) {
      return alert("Erro: Selecione um orçamento.");
    }

    if (
      selectedAccessoryIds.length === 0 ||
      !plan.taken_by_id ||
      !plan.taken_at
    ) {
      return alert("Preencha o acessório, quem retira e a data da retirada.");
    }

    if (
      plan.returned_at &&
      new Date(plan.returned_at) < new Date(plan.taken_at)
    ) {
      return alert("A devolução não pode ser antes da retirada.");
    }

    try {
      await Promise.all(
        selectedAccessoryIds.map((accessoryId) =>
          loanToBudget(
            currentBudget.id,
            accessoryId,
            plan.taken_by_id,
            plan.taken_at,
            plan.received_by_id,
            plan.returned_at,
          ),
        ),
      );

      setSelectedAccessoryIds([]);

      setPlan((prev) => ({
        ...prev,
        taken_at: getTodayDate(),
        returned_at: "",
      }));

      refreshData();

      if (onRefresh) {
        onRefresh();
      }
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
    ) {
      return alert("Preencha os campos.");
    }

    try {
      await updateBudgetLoan(movementId, editForm);

      setEditingId(null);

      refreshData();

      if (onRefresh) {
        onRefresh();
      }
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

        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar.");
      }
    }
  };

  let displayGroups = Object.keys(groupedData);

  const selectedBudgetName = currentBudget?.name || currentBudget?.budget_name;

  if (currentBudget?.id && selectedBudgetName) {
    displayGroups = [selectedBudgetName];
  }

  const renderSelect = ({ selected, options, placeholder, onChange }) => (
    <SelectMenu
      variant="full"
      maxSelections={1}
      options={options}
      selectedOption={selected ? [selected] : []}
      setSelectedOption={(value) => {
        const result =
          typeof value === "function"
            ? value(selected ? [selected] : [])[0]
            : value?.[0];

        onChange(result || "");
      }}
      placeholder={placeholder}
    />
  );

  return (
    <div className="flex w-full flex-col gap-5">
      {displayGroups.map((groupName) => {
        const loans = groupedData[groupName] || [];
        const isCurrentBudget = selectedBudgetName === groupName;

        return (
          <div key={groupName} className="flex w-full flex-col ">
            {!currentBudget?.id && (
              <div className="flex items-center justify-between border border-[#DFE1E6] bg-white px-3 py-2">
                <h2 className="text-sm font-semibold text-[#172B4D]">
                  {groupName}
                </h2>

                <span className="rounded-full bg-[#F4F5F7] px-2 py-1 text-[10px] font-semibold text-[#5E6C84]">
                  {loans.length} {loans.length === 1 ? "item" : "itens"}
                </span>
              </div>
            )}

            <div className="w-full overflow-x-auto border border-[#DFE1E6] bg-white">
              <table className="w-full min-w-[850px] table-fixed border-collapse">
                <colgroup>
                  <col className="w-[25%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[17%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Item
                    </th>

                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Quem Retira
                    </th>

                    <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Retirada
                    </th>

                    <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Quem Devolve
                    </th>

                    <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Devolução
                    </th>

                    <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
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
                        className={`border-b border-[#EBECF0] transition-colors ${
                          isEditing
                            ? "bg-[#FFFAE6]"
                            : "bg-white hover:bg-[#F4F5F7]"
                        }`}
                      >
                        <td className="px-1.5 py-2">
                          {isEditing ? (
                            renderSelect({
                              selected: editForm.accessory_id,
                              options: accessoryOptions,
                              placeholder: "Selecionar item...",
                              onChange: (id) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  accessory_id: id,
                                })),
                            })
                          ) : (
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F4F5F7] text-[#5E6C84]">
                                <FaHistory size={10} />
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-[#172B4D]">
                                  {loan.accessory_name}
                                </p>

                                {loan.serial_number && (
                                  <p className="truncate text-[9px] text-[#8993A4]">
                                    S/N: {loan.serial_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-2 py-2">
                          {isEditing ? (
                            renderSelect({
                              selected: editForm.taken_by_user_id,
                              options: employeeOptions,
                              placeholder: "Selecionar...",
                              onChange: (id) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  taken_by_user_id: id,
                                })),
                            })
                          ) : (
                            <span className="text-[11px] text-[#5E6C84]">
                              {loan.taken_by_name || "-"}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-2">
                          {isEditing ? (
                            <input
                              type="date"
                              className="h-9 w-[110px] border border-[#DFE1E6] bg-white px-1 py-1 text-left text-xs text-[#172B4D] transition-colors hover:bg-[#F4F5F7] focus:border-[#4C9AFF] focus:outline-none focus:ring-2 focus:ring-[#DEEBFF]"
                              value={editForm.taken_at}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  taken_at: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-[11px] text-[#5E6C84]">
                              {formatDateTime(loan.taken_at)}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-2">
                          {isEditing ? (
                            renderSelect({
                              selected: editForm.received_by_user_id,
                              options: employeeOptions,
                              placeholder: "Selecionar...",
                              onChange: (id) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  received_by_user_id: id,
                                })),
                            })
                          ) : (
                            <span className="text-[11px] text-[#5E6C84]">
                              {loan.received_by_name || "-"}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-2">
                          {isEditing ? (
                            <input
                              type="date"
                              className="h-9 w-[110px] border border-[#DFE1E6] bg-white px-1 py-1 text-left text-xs text-[#172B4D] transition-colors hover:bg-[#F4F5F7] focus:border-[#4C9AFF] focus:outline-none focus:ring-2 focus:ring-[#DEEBFF]"
                              value={editForm.returned_at}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  returned_at: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-[11px] text-[#5E6C84]">
                              {formatDateTime(loan.returned_at)}
                            </span>
                          )}
                        </td>

                        <td className="px-2 py-2 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdate(loan.movement_id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E3FCEF] text-[#00875A] transition hover:bg-[#ABF5D1]"
                                title="Salvar"
                              >
                                <FaCheck size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFEBE6] text-[#DE350B] transition hover:bg-[#FFBDAD]"
                                title="Cancelar"
                              >
                                <FaTimes size={11} />
                              </button>
                            </div>
                          ) : (
                            isCurrentBudget && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditing(loan)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#5E6C84] transition hover:bg-[#DEEBFF] hover:text-[#0052CC]"
                                  title="Editar"
                                >
                                  <FaEdit size={11} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(loan.movement_id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#5E6C84] transition hover:bg-[#FFEBE6] hover:text-[#DE350B]"
                                  title="Excluir"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {isCurrentBudget && !editingId && (
                    <tr className="border-t border-[#DFE1E6] bg-[#F7F8FA]">
                      <td className="px-1.5 py-2">
                        <SelectMenu
                          variant="full"
                          maxSelections={0}
                          options={accessoryOptions}
                          selectedOption={selectedAccessoryIds}
                          setSelectedOption={setSelectedAccessoryIds}
                          closeOnSelect={false}
                          searchable={true}
                          searchPlaceholder="Pesquisar acessório..."
                          confirmOnEnter={true}
                          placeholder="Selecionar acessórios..."
                        />
                      </td>

                      <td className="px-2 py-2">
                        {renderSelect({
                          selected: plan.taken_by_id,
                          options: employeeOptions,
                          placeholder: "Selecionar...",
                          onChange: (id) =>
                            setPlan((prev) => ({
                              ...prev,
                              taken_by_id: id,
                            })),
                        })}
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="date"
                          className="h-9 w-[110px] border border-[#DFE1E6] bg-white px-1 py-1 text-left text-xs text-[#172B4D] transition-colors hover:bg-[#F4F5F7] focus:border-[#4C9AFF] focus:outline-none focus:ring-2 focus:ring-[#DEEBFF]"
                          value={plan.taken_at}
                          onChange={(e) =>
                            setPlan((prev) => ({
                              ...prev,
                              taken_at: e.target.value,
                            }))
                          }
                        />
                      </td>

                      <td className="px-2 py-2">
                        {renderSelect({
                          selected: plan.received_by_id,
                          options: employeeOptions,
                          placeholder: "Selecionar...",
                          onChange: (id) =>
                            setPlan((prev) => ({
                              ...prev,
                              received_by_id: id,
                            })),
                        })}
                      </td>

                      <td className="px-2 py-2">
                        <input
                          type="date"
                          className="h-9 w-[110px] border border-[#DFE1E6] bg-white px-1 py-1 text-left text-xs text-[#172B4D] transition-colors hover:bg-[#F4F5F7] focus:border-[#4C9AFF] focus:outline-none focus:ring-2 focus:ring-[#DEEBFF]"
                          value={plan.returned_at}
                          onChange={(e) =>
                            setPlan((prev) => ({
                              ...prev,
                              returned_at: e.target.value,
                            }))
                          }
                        />
                      </td>

                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={handleSavePlan}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleSavePlan();
                            }
                          }}
                          className="h-8 w-full rounded-md bg-[#0052CC] px-3 text-[10px] font-semibold text-white transition hover:bg-[#0747A6]"
                        >
                          Adicionar
                        </button>
                      </td>
                    </tr>
                  )}

                  {loans.length === 0 && !isCurrentBudget && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center">
                        <p className="text-sm font-medium text-[#172B4D]">
                          Nenhum planejamento encontrado
                        </p>
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
        <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-[#DFE1E6] bg-white">
          <p className="text-sm text-[#5E6C84]">Nenhum dado encontrado.</p>
        </div>
      )}
    </div>
  );
}
