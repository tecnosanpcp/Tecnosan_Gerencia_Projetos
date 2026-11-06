import { IoMdClose } from "react-icons/io";
import {
  FiCalendar,
  FiClock,
  FiFolder,
  FiTool,
  FiUsers,
  FiPackage,
  FiActivity,
} from "react-icons/fi";
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

  // Consumo / Refugo
  const [inputValues, setInputValues] = useState({});
  const [wasteValues, setWasteValues] = useState({});

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
        setFinishDate(
          formatDateForInput(taskData.completion_date) || ""
        );
        setDeadline(formatDateForInput(taskData.deadline));
        setSelectEmp(responsible.map((res) => res.user_id) || []);
        setStatus([taskData?.status]);
        setTotalTimeSpent(taskData.total_time_spent || "");

        setInputValues({});
        setWasteValues({});
        setTimesheetValues({});

        const materialData =
          await vwMaterialDetailsComponentsRecipes(
            taskData.component_recipe_id,
          );

        const consumedMaterialData =
          await vwComponentMaterialsSummary();

        if (
          !Array.isArray(materialData) ||
          !Array.isArray(consumedMaterialData)
        ) {
          return;
        }

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
        .filter(
          (r) => r.component_id == taskData.component_id,
        )
        .map((r) => r.user_id);

      const toAdd = selectEmp.filter(
        (id) => !dbIds.includes(Number(id)),
      );

      const toRemove = dbIds.filter(
        (id) => !selectEmp.map(Number).includes(id),
      );

      // 3a. Consumo
      const consumptionPromises = Object.entries(inputValues).map(
        async ([matId, quantity]) => {
          const qtd = parseFloat(quantity);

          if (!qtd) return;

          return addMaterialConsumption(
            taskData.component_id,
            parseInt(matId),
            qtd,
            user?.user_id,
            "consumido",
          );
        },
      );

      // 3b. Refugo
      const wastePromises = Object.entries(wasteValues).map(
        async ([matId, quantity]) => {
          const qtd = parseFloat(quantity);

          if (!qtd) return;

          return addMaterialConsumption(
            taskData.component_id,
            parseInt(matId),
            qtd,
            user?.user_id,
            "refugo",
          );
        },
      );

      // 4. Apontamento de horas
      const timesheetPromises = Object.entries(
        timesheetValues,
      ).map(async ([userId, times]) => {
        if (!times.start || !times.end) return;

        const payload = {
          component_id: taskData.component_id,
          user_id: parseInt(userId),
          start_time: fmt(times.start),
          end_time: fmt(times.end),
        };

        return createTimesheet(payload);
      });

      // 5. Executa tudo
      await Promise.all([
        ...toAdd.map((id) =>
          createEmployeesComponents(
            taskData.component_id,
            id,
          ),
        ),

        ...toRemove.map((id) =>
          deleteEmployeesComponents(
            taskData.component_id,
            id,
          ),
        ),

        ...consumptionPromises,
        ...wastePromises,
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
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#091E42]/45
        p-4
        backdrop-blur-[2px]
      "
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-[980px]
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-[#DFE1E6]
          bg-white
          shadow-[0_12px_40px_rgba(9,30,66,0.22)]
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-[#DFE1E6]
            bg-white
            px-5
            py-4
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-[#E9F2FF]
                text-[#0052CC]
              "
            >
              <FiActivity className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-[17px]
                  font-semibold
                  tracking-[-0.01em]
                  text-[#172B4D]
                "
              >
                Detalhes da Tarefa
              </h2>

              <p className="mt-0.5 truncate text-xs text-[#5E6C84]">
                Gerencie produção, materiais, responsáveis e horas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              text-[#5E6C84]
              transition-colors
              hover:bg-[#F4F5F7]
              hover:text-[#172B4D]
            "
          >
            <IoMdClose className="h-5 w-5" />
          </button>
        </header>

        {/* =====================================================
            BODY
        ===================================================== */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            bg-[#F4F5F7]
            px-5
            py-5
          "
        >
          <div className="space-y-4">

            {/* =================================================
                INFORMAÇÕES PRINCIPAIS
            ================================================= */}
            <section
              className="
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
                p-4
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <FiTool className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Informações da tarefa
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* NOME */}
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Nome da tarefa
                  </label>

                  <div
                    className="
                      flex
                      min-h-10
                      items-center
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-[#F4F5F7]
                      px-3
                      text-sm
                      font-medium
                      text-[#172B4D]
                    "
                  >
                    {taskData?.component_name || "—"}
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Status{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <SelectMenu
                    maxSelections={1}
                    options={listStatus}
                    selectedOption={status}
                    setSelectedOption={setStatus}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                DATAS
            ================================================= */}
            <section
              className="
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
                p-4
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <FiCalendar className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Planejamento e datas
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* INÍCIO */}
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Data inicial
                  </label>

                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-white
                      px-3
                      text-sm
                      text-[#172B4D]
                      outline-none
                      transition
                      hover:border-[#B7BDC8]
                      focus:border-[#0052CC]
                      focus:ring-2
                      focus:ring-[#0052CC]/15
                    "
                  />
                </div>

                {/* PRAZO */}
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Prazo
                  </label>

                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(e.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-white
                      px-3
                      text-sm
                      text-[#172B4D]
                      outline-none
                      transition
                      hover:border-[#B7BDC8]
                      focus:border-[#0052CC]
                      focus:ring-2
                      focus:ring-[#0052CC]/15
                    "
                  />
                </div>

                {/* FINALIZAÇÃO */}
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Data de finalização
                  </label>

                  <input
                    type="datetime-local"
                    value={finishDate}
                    onChange={(e) =>
                      setFinishDate(e.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-white
                      px-3
                      text-sm
                      text-[#172B4D]
                      outline-none
                      transition
                      hover:border-[#B7BDC8]
                      focus:border-[#0052CC]
                      focus:ring-2
                      focus:ring-[#0052CC]/15
                    "
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                TEMPO
            ================================================= */}
            <section
              className="
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
                p-4
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <FiClock className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Controle de tempo
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Tempo total planejado
                  </label>

                  <div
                    className="
                      flex
                      h-10
                      items-center
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-[#F4F5F7]
                      px-3
                      text-sm
                      font-medium
                      text-[#172B4D]
                    "
                  >
                    {recipe?.man_hours || "—"}
                  </div>
                </div>

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Tempo total gasto
                  </label>

                  <input
                    type="text"
                    placeholder="Ex: 2h 30m"
                    value={totalTimeSpent}
                    onChange={(e) =>
                      setTotalTimeSpent(e.target.value)
                    }
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-[#DFE1E6]
                      bg-white
                      px-3
                      text-sm
                      text-[#172B4D]
                      outline-none
                      transition
                      placeholder:text-[#97A0AF]
                      hover:border-[#B7BDC8]
                      focus:border-[#0052CC]
                      focus:ring-2
                      focus:ring-[#0052CC]/15
                    "
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                RESPONSÁVEIS
            ================================================= */}
            <section
              className="
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
                p-4
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <FiUsers className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Responsáveis
                </h3>
              </div>

              <SelectMenu
                variant="full"
                options={employees.map((emp) => ({
                  id: emp.user_id,
                  label: emp.user_name,
                }))}
                selectedOption={selectEmp}
                setSelectedOption={setSelectEmp}
              />
            </section>

            {/* =================================================
                MATERIAIS
            ================================================= */}
            <section
              className="
                overflow-hidden
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[#DFE1E6]
                  px-4
                  py-3
                "
              >
                <div className="flex items-center gap-2">
                  <FiPackage className="h-4 w-4 text-[#0052CC]" />

                  <div>
                    <h3 className="text-sm font-semibold text-[#172B4D]">
                      Consumo e refugo de materiais
                    </h3>

                    <p className="mt-0.5 text-xs text-[#5E6C84]">
                      Registre o material utilizado e o desperdício.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Material
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Planejado
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Já usado
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#00875A]">
                        Add. consumo
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#DE350B]">
                        Add. refugo
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {materials.map((mat, index) => {
                      const found = consumedMaterial.find(
                        (aux) =>
                          mat?.material_id ==
                            aux?.material_id &&
                          taskData?.component_id ==
                            aux?.component_id,
                      );

                      const amount =
                        found?.total_consumed || 0;

                      return (
                        <tr
                          key={index}
                          className="
                            border-b
                            border-[#F0F1F2]
                            last:border-0
                            hover:bg-[#FAFBFC]
                          "
                        >
                          <td className="px-4 py-3 font-medium text-[#172B4D]">
                            {mat.material_name}
                          </td>

                          <td className="px-4 py-3 text-[#5E6C84]">
                            {mat.quantity_plan} {mat.uni}
                          </td>

                          <td className="px-4 py-3 text-[#5E6C84]">
                            {amount} {mat.uni}
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Qtd."
                              value={
                                inputValues[
                                  mat.material_id
                                ] || ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;

                                setInputValues((prev) => ({
                                  ...prev,
                                  [mat.material_id]: val,
                                }));
                              }}
                              className="
                                h-8
                                w-24
                                rounded-md
                                border
                                border-[#B7E3D1]
                                bg-[#E3FCEF]
                                px-2
                                text-sm
                                text-[#172B4D]
                                outline-none
                                transition
                                focus:border-[#00875A]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#00875A]/10
                              "
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Qtd."
                              value={
                                wasteValues[
                                  mat.material_id
                                ] || ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;

                                setWasteValues((prev) => ({
                                  ...prev,
                                  [mat.material_id]: val,
                                }));
                              }}
                              className="
                                h-8
                                w-24
                                rounded-md
                                border
                                border-[#F5C6BE]
                                bg-[#FFEBE6]
                                px-2
                                text-sm
                                text-[#172B4D]
                                outline-none
                                transition
                                focus:border-[#DE350B]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#DE350B]/10
                              "
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {materials.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="
                            px-4
                            py-8
                            text-center
                            text-sm
                            text-[#97A0AF]
                          "
                        >
                          Nenhum material vinculado à receita.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* =================================================
                APONTAMENTO DE HORAS
            ================================================= */}
            <section
              className="
                overflow-hidden
                rounded-lg
                border
                border-[#DFE1E6]
                bg-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border-b
                  border-[#DFE1E6]
                  px-4
                  py-3
                "
              >
                <FiClock className="h-4 w-4 text-[#0052CC]" />

                <div>
                  <h3 className="text-sm font-semibold text-[#172B4D]">
                    Apontamento de horas
                  </h3>

                  <p className="mt-0.5 text-xs text-[#5E6C84]">
                    Registre o período trabalhado por cada responsável.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Funcionário
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Início do trabalho
                      </th>

                      <th className="px-4 py-2.5 text-xs font-semibold text-[#5E6C84]">
                        Fim do trabalho
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedEmployees.map((emp) => (
                      <tr
                        key={emp.user_id}
                        className="
                          border-b
                          border-[#F0F1F2]
                          last:border-0
                          hover:bg-[#FAFBFC]
                        "
                      >
                        <td className="px-4 py-3 font-medium text-[#172B4D]">
                          {emp.user_name}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="datetime-local"
                            value={
                              timesheetValues[
                                emp.user_id
                              ]?.start || ""
                            }
                            onChange={(e) =>
                              handleTimesheetChange(
                                emp.user_id,
                                "start",
                                e.target.value,
                              )
                            }
                            className="
                              h-9
                              w-full
                              rounded-md
                              border
                              border-[#DFE1E6]
                              bg-white
                              px-2
                              text-sm
                              text-[#172B4D]
                              outline-none
                              transition
                              hover:border-[#B7BDC8]
                              focus:border-[#0052CC]
                              focus:ring-2
                              focus:ring-[#0052CC]/15
                            "
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="datetime-local"
                            value={
                              timesheetValues[
                                emp.user_id
                              ]?.end || ""
                            }
                            onChange={(e) =>
                              handleTimesheetChange(
                                emp.user_id,
                                "end",
                                e.target.value,
                              )
                            }
                            className="
                              h-9
                              w-full
                              rounded-md
                              border
                              border-[#DFE1E6]
                              bg-white
                              px-2
                              text-sm
                              text-[#172B4D]
                              outline-none
                              transition
                              hover:border-[#B7BDC8]
                              focus:border-[#0052CC]
                              focus:ring-2
                              focus:ring-[#0052CC]/15
                            "
                          />
                        </td>
                      </tr>
                    ))}

                    {assignedEmployees.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="
                            px-4
                            py-8
                            text-center
                            text-sm
                            text-[#97A0AF]
                          "
                        >
                          Nenhum funcionário selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <footer
          className="
            flex
            shrink-0
            items-center
            justify-end
            gap-2
            border-t
            border-[#DFE1E6]
            bg-[#FAFBFC]
            px-5
            py-3
          "
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              h-9
              rounded-md
              border
              border-[#DFE1E6]
              bg-white
              px-4
              text-sm
              font-medium
              text-[#172B4D]
              transition-colors
              hover:bg-[#F4F5F7]
            "
          >
            Fechar
          </button>

          <button
            type="submit"
            className="
              h-9
              rounded-md
              bg-[#0052CC]
              px-4
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-[#0065FF]
              active:bg-[#0747A6]
            "
          >
            Salvar Apontamento
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

export default TaskModal;