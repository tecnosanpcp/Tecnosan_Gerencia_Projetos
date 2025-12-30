import { IoMdClose } from "react-icons/io";
import SelectMenu from "./SelectMenu";
import { useState } from "react";

import { createComponents } from "@services/ComponentsServices.js";
import { createEmployeesComponents } from "@services/EmployeesComponentsServices.js";

function AddComponent({
  isOpen,
  setOpen,
  departmens = [],
  equipments = [],
  projects = [],
  employees = [],
  recipes = [],
}) {
  const [selectDept, setSelectedDept] = useState([]);
  const [selectedProj, setSelectedProj] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const clearForms = () => {
    setSelectedDept([]);
    setSelectedProj([]);
    setSelectedEquip([]);
    setSelectedEmp([]);
    setSelectedRecipe([]);

    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");

    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const deadline = `${endDate} ${endTime}:00`;
      const start_date = `${startDate} ${startTime}:00`;
      const equipment_id = selectedEquip[0];
      const department_id = selectDept[0];
      const recipe = recipes.find(
        (recipe) => selectedRecipe[0] === recipe.component_recipe_id
      );
      // 1. CRIA O COMPONENTE
      const response = await createComponents(
        recipe.recipe_name,
        null,
        start_date,
        deadline,
        "Pending",
        equipment_id,
        department_id,
        recipe.component_recipe_id
      );

      // Verificação de segurança
      if (!response || response.length === 0) {
        console.error("Erro: O servidor não retornou o ID do componente.");
        return;
      }

      const component_id = response[0].component_id;
      await Promise.all(
        selectedEmp.map((user_id) =>
          createEmployeesComponents(component_id, user_id)
        )
      );

      clearForms();
      setOpen(!isOpen);
    } catch (error) {
      console.error("Erro no submit:", error);
      alert("Ocorreu um erro ao salvar.");
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <form
            className="bg-gray-200 p-6 rounded-lg shadow-lg w-1/2 flex flex-col space-y-8"
            onSubmit={(e) => handleSubmit(e)}
          >
            <div className="flex flex-row items-center justify-between">
              <p className="text-lg font-semibold">Novo Componente</p>
              <button
                onClick={() => {
                  setOpen(false);
                }}
                type="button"
              >
                <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
              </button>
            </div>
            <div className="flex flex-row items-center justify-between space-x-8">
              <div className="flex flex-col w-full">
                <label htmlFor="project_name" className="text-gray-700">
                  Componente *
                </label>
                <SelectMenu
                  variant="full"
                  maxSelections={1}
                  options={recipes.map((recipe) => ({
                    id: recipe.component_recipe_id,
                    label: recipe.recipe_name,
                  }))}
                  selectedOption={selectedRecipe}
                  setSelectedOption={setSelectedRecipe}
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between space-x-8">
              <div className="flex flex-col w-full">
                <label htmlFor="weekDays" className="text-gray-700">
                  Data Inicial *
                </label>
                <input
                  type="date"
                  className="p-2 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col w-full">
                <label name="hourInit" className="text-gray-700">
                  Hora Inicial *
                </label>
                <input
                  type="time"
                  name="hourInit"
                  className="p-2 rounded bg-gray-50"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Horas */}
            <div className="flex flex-row items-center justify-between space-x-8">
              <div className="flex flex-col w-full">
                <label htmlFor="weekDays" className="text-gray-700">
                  Data Final *
                </label>
                <input
                  type="date"
                  className="p-2 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col w-full">
                <label name="hourEnd" className="text-gray-700">
                  Hora Final *
                </label>
                <input
                  type="time"
                  name="hourEnd"
                  className="p-2 rounded bg-gray-50"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between space-x-8">
              <div className="flex flex-col w-full">
                <label htmlFor="project" className="text-gray-700">
                  Projeto *
                </label>
                <SelectMenu
                  variant="full"
                  options={projects.map((p) => ({
                    id: p.project_id,
                    label: p.project_name,
                  }))}
                  selectedOption={selectedProj}
                  setSelectedOption={setSelectedProj}
                  maxSelections={1}
                />
              </div>
              <div className="flex flex-col w-full">
                <label htmlFor="project" className="text-gray-700">
                  Equipamento *
                </label>
                <SelectMenu
                  variant="full"
                  options={equipments
                    .filter((e) => e.project_id == selectedProj[0])
                    .map((e) => ({
                      id: e.equipment_id,
                      label: e.equipment_name,
                    }))}
                  maxSelections={1}
                  selectedOption={selectedEquip}
                  setSelectedOption={setSelectedEquip}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="employees" className="text-gray-700">
                Departamento *
              </label>
              <SelectMenu
                name="departament"
                variant="full"
                options={departmens.map((dep) => {
                  return {
                    id: dep.department_id,
                    label: dep.department_name,
                  };
                })}
                selectedOption={selectDept}
                setSelectedOption={setSelectedDept}
                maxSelections={1}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="employees" className="text-gray-700">
                Responsáveis *
              </label>
              <SelectMenu
                variant="full"
                options={employees.map((e) => ({
                  id: e.user_id,
                  label: e.user_name,
                }))}
                selectedOption={selectedEmp}
                setSelectedOption={setSelectedEmp}
              />
            </div>
            <div className="flex flex-row justify-end items-center space-x-4">
              <button
                className="bnt"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancelar
              </button>
              <button className="bnt-add" type="submit">
                Criar Componente
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default AddComponent;
