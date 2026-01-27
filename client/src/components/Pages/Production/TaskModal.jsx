import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatDateForInput } from "../../../utils/dateUtils";
import SelectMenu from "../../Ui/SelectMenu";

import { VerifyAuth } from "@services/AuthService.js";
import { vwMaterialDetailsComponentsRecipes } from "@services/ViewsService.js";
import { vwComponentMaterialsSummary } from "@services/ViewsSummary.js";
import { addMaterialConsumption } from "@services/ComponentsMaterialsServices.js";
import { updateComponents } from "@services/ComponentsServices.js";
import {
  getEmployeesComponents,
  createEmployeesComponents,
  deleteEmployeesComponents,
} from "@services/EmployeesComponentsServices.js";

import { createTimesheet } from "@services/TimesheetServices";

function TaskModal({
  isOpen,
  setOpen,
  employees = [],
  responsible = [],
  taskData = null,
  recipe = null,
}) {
  // Datas e Prazos
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [status, setStatus] = useState([]);

  // Tempo total
  const [totalTimeSpent, setTotalTimeSpent] = useState("");

  // Dados de Visualização
  const [consumedMaterial, setConsumendMaterial] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Pessoas
  const [selectEmp, setSelectEmp] = useState([]);

  // --- ALTERAÇÃO 1: Adicionado estado para Refugo ---
  const [inputValues, setInputValues] = useState({}); // Consumo (Normal)
  const [wasteValues, setWasteValues] = useState({}); // Refugo (Desperdício)

  const [timesheetValues, setTimesheetValues] = useState({});

  const listStatus = [
    { id: "Pending", label: "Planejado" },
    { id: "Running", label: "Em Execução" },
    { id: "Completed", label: "Concluído" },
    { id: "Failed", label: "Não Concluído" },
  ];

  useEffect(() => {
    const init = async () => {
      if (isOpen && taskData) {
        setStartDate(formatDateForInput(taskData.start_date) || "");
        setFinishDate(formatDateForInput(taskData.completion_date) || "");
        setDeadline(formatDateForInput(taskData.deadline));
        setSelectEmp(responsible.map((res) => res.user_id) || []);
        setStatus([taskData?.status]);
        setTotalTimeSpent(taskData.total_time_spent || "");

        // Reseta inputs
        setInputValues({});
        setWasteValues({}); // <--- Limpa o refugo ao abrir
        setTimesheetValues({});

        const materialData = await vwMaterialDetailsComponentsRecipes(
          taskData.component_recipe_id,
        );

        const consumedMaterialData = await vwComponentMaterialsSummary();

        if (
          !Array.isArray(materialData) ||
          !Array.isArray(consumedMaterialData)
        )
          return;

        setMaterials(materialData);
        setConsumendMaterial(consumedMaterialData);
      }
    };
    init();
  }, [isOpen, responsible, taskData]);

  const handleTimesheetChange = (userId, field, value) => {
    setTimesheetValues((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fmt = (d) => (d ? d.replace("T", " ") + ":00" : null);
      const user = await VerifyAuth();

      // 1. Atualiza Componente
      await updateComponents(
        taskData.component_id,
        fmt(finishDate),
        fmt(startDate),
        fmt(deadline),
        status[0],
        taskData.department_id,
        parseFloat(totalTimeSpent) || 0,
      );

      // 2. Sincronização Funcionários
      const allRelations = await getEmployeesComponents();
      const dbIds = allRelations
        .filter((r) => r.component_id == taskData.component_id)
        .map((r) => r.user_id);

      const toAdd = selectEmp.filter((id) => !dbIds.includes(Number(id)));
      const toRemove = dbIds.filter(
        (id) => !selectEmp.map(Number).includes(id),
      );

      // --- ALTERAÇÃO 2: Processar Consumo E Refugo ---

      // 3a. Processar Consumo (Normal) - Envia 'consumido'
      const consumptionPromises = Object.entries(inputValues).map(
        async ([matId, quantity]) => {
          const qtd = parseFloat(quantity);
          if (!qtd) return;
          return addMaterialConsumption(
            taskData.component_id,
            parseInt(matId),
            qtd,
            user?.user_id,
            "consumido", // <--- IMPORTANTE: Verifique se seu service aceita este parametro extra
          );
        },
      );

      // 3b. Processar Refugo (Waste) - Envia 'refugo'
      const wastePromises = Object.entries(wasteValues).map(
        async ([matId, quantity]) => {
          const qtd = parseFloat(quantity);
          if (!qtd) return;
          return addMaterialConsumption(
            taskData.component_id,
            parseInt(matId),
            qtd,
            user?.user_id,
            "refugo", // <--- Envia como tipo Refugo
          );
        },
      );

      // 4. Apontamento de Horas
      const timesheetPromises = Object.entries(timesheetValues).map(
        async ([userId, times]) => {
          if (!times.start || !times.end) return;
          const payload = {
            component_id: taskData.component_id,
            user_id: parseInt(userId),
            start_time: fmt(times.start),
            end_time: fmt(times.end),
          };
          return createTimesheet(payload);
        },
      );

      // 5. Executa tudo
      await Promise.all([
        ...toAdd.map((id) =>
          createEmployeesComponents(taskData.component_id, id),
        ),
        ...toRemove.map((id) =>
          deleteEmployeesComponents(taskData.component_id, id),
        ),
        ...consumptionPromises,
        ...wastePromises, // <--- Adiciona as promessas de refugo
        ...timesheetPromises,
      ]);

      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados. Verifique o console.");
    }
  };

  if (!isOpen) return null;

  const assignedEmployees = employees.filter((emp) =>
    selectEmp.map(Number).includes(emp.user_id),
  );

  return createPortal(
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-10">
      <form
        className="bg-gray-200 p-6 rounded-lg shadow-lg w-3/4 flex flex-col space-y-6" // Aumentei w-1/2 para w-3/4 para caber a nova coluna
        onSubmit={handleSubmit}
      >
        {/* Header, Nome, Status e Datas mantidos iguais... */}
        <div className="flex flex-row items-center justify-between">
          <p className="text-lg font-semibold">Detalhes da Tarefa</p>
          <button onClick={() => setOpen(false)} type="button">
            <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
          </button>
        </div>

        <div className="flex flex-row items-center justify-between space-x-8">
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-medium">Nome da Tarefa</label>
            <p className="p-2 rounded bg-white">
              {taskData.component_name || ""}
            </p>
          </div>
          <div className="flex flex-col w-full">
            <label>Status *</label>
            <SelectMenu
              maxSelections={1}
              options={listStatus}
              selectedOption={status}
              setSelectedOption={setStatus}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between space-x-4">
          <div className="flex flex-col w-full">
            <label className="text-gray-700">Data Inicial</label>
            <input
              type="datetime-local"
              className="p-2 rounded bg-gray-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-gray-700">Prazo</label>
            <input
              type="datetime-local"
              className="p-2 rounded bg-gray-50"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-gray-700">Data de Finalização</label>
            <input
              type="datetime-local"
              className="p-2 rounded border-2"
              value={finishDate}
              onChange={(e) => setFinishDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between space-x-8">
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold">
              Tempo Total Planejado
            </label>
            <p className="p-2 rounded bg-white"> {recipe?.man_hours} </p>
          </div>
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold">Tempo Total Gasto</label>
            <input
              type="text"
              className="p-2 rounded"
              placeholder="Ex: 2h 30m"
              value={totalTimeSpent}
              onChange={(e) => setTotalTimeSpent(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col w-full">
          <label className="text-gray-700 mb-1">Responsáveis </label>
          <SelectMenu
            variant="full"
            options={employees.map((emp) => ({
              id: emp.user_id,
              label: emp.user_name,
            }))}
            selectedOption={selectEmp}
            setSelectedOption={setSelectEmp}
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="text-gray-700 mb-1 font-medium">
            Consumo e Refugo de Materiais
          </label>
          <div className="bg-white rounded overflow-hidden shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-4 py-2">Material</th>
                  <th className="px-4 py-2">Planejado</th>
                  <th className="px-4 py-2">Já Usado</th>
                  <th className="px-4 py-2 text-green-700">Add Consumo</th>
                  <th className="px-4 py-2 text-red-700">Add Refugo</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, index) => {
                  const found = consumedMaterial.find(
                    (aux) =>
                      mat?.material_id == aux?.material_id &&
                      taskData?.component_id == aux?.component_id,
                  );
                  const amount = found?.total_consumed || 0;

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-4 py-2">{mat.material_name}</td>
                      <td className="px-4 py-2">
                        {mat.quantity_plan} {mat.uni}
                      </td>
                      <td className="px-4 py-2">
                        {amount} {mat.uni}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Qtd."
                          className="w-24 p-1 border border-green-200 rounded bg-green-50 focus:bg-white focus:border-green-500"
                          value={inputValues[mat.material_id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputValues((prev) => ({
                              ...prev,
                              [mat.material_id]: val,
                            }));
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Refugo"
                          className="w-24 p-1 border border-red-200 rounded bg-red-50 focus:bg-white focus:border-red-500"
                          value={wasteValues[mat.material_id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWasteValues((prev) => ({
                              ...prev,
                              [mat.material_id]: val,
                            }));
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      Nenhum material vinculado à receita.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Horas e Botões mantidos iguais... */}
        <div className="flex flex-col w-full">
          {/* ... código da tabela de horas ... */}
          <label className="text-gray-700 mb-1 font-medium">
            Apontamento de Horas
          </label>
          <div className="bg-white rounded overflow-hidden shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-4 py-2">Funcionário</th>
                  <th className="px-4 py-2">Início Trabalho</th>
                  <th className="px-4 py-2">Fim Trabalho</th>
                </tr>
              </thead>
              <tbody>
                {assignedEmployees.map((emp) => (
                  <tr key={emp.user_id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{emp.user_name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="datetime-local"
                        className="p-1 border rounded bg-yellow-50 focus:bg-white w-full"
                        value={timesheetValues[emp.user_id]?.start || ""}
                        onChange={(e) =>
                          handleTimesheetChange(
                            emp.user_id,
                            "start",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="datetime-local"
                        className="p-1 border rounded bg-yellow-50 focus:bg-white w-full"
                        value={timesheetValues[emp.user_id]?.end || ""}
                        onChange={(e) =>
                          handleTimesheetChange(
                            emp.user_id,
                            "end",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
                {assignedEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      Nenhum funcionário selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-row justify-end items-center space-x-4 pt-4 border-t border-gray-300">
          <button className="bnt" onClick={() => setOpen(false)} type="button">
            Fechar
          </button>
          <button className="bnt-add" type="submit">
            Salvar Apontamento
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

export default TaskModal;
