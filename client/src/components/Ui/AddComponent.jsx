import { IoMdClose } from "react-icons/io";
import {
  FiCalendar,
  FiClock,
  FiFolder,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import SelectMenu from "./SelectMenu";
import { useEffect, useState } from "react";

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
  initialDate = "",
  onCreated,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialDate) {
      setStartDate(initialDate);
      setEndDate(initialDate);
    }
  }, [isOpen, initialDate]);

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

    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    clearForms();
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!selectedRecipe[0]) {
        alert("Selecione o componente.");
        setIsSubmitting(false);
        return;
      }

      if (!selectedProj[0]) {
        alert("Selecione o projeto.");
        setIsSubmitting(false);
        return;
      }

      if (!selectedEquip[0]) {
        alert("Selecione o equipamento.");
        setIsSubmitting(false);
        return;
      }

      if (!selectDept[0]) {
        alert("Selecione o departamento.");
        setIsSubmitting(false);
        return;
      }

      if (!startDate || !startTime) {
        alert("Informe a data e hora inicial.");
        setIsSubmitting(false);
        return;
      }

      if (!endDate || !endTime) {
        alert("Informe a data e hora final.");
        setIsSubmitting(false);
        return;
      }

      const recipe = recipes.find(
        (item) =>
          Number(item.component_recipe_id) === Number(selectedRecipe[0])
      );

      if (!recipe) {
        alert("Não foi possível encontrar o componente selecionado.");
        setIsSubmitting(false);
        return;
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime < startDateTime) {
        alert(
          "A data/hora final não pode ser anterior à data/hora inicial."
        );
        setIsSubmitting(false);
        return;
      }

      const deadline = `${endDate} ${endTime}:00`;
      const start_date = `${startDate} ${startTime}:00`;

      const equipment_id = selectedEquip[0];
      const department_id = selectDept[0];

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

      if (!response || !Array.isArray(response) || response.length === 0) {
        console.error(
          "Erro: O servidor não retornou o ID do componente."
        );

        alert(
          "Não foi possível criar o componente. Verifique os dados e tente novamente."
        );

        setIsSubmitting(false);
        return;
      }

      const component_id = response[0]?.component_id;

      if (!component_id) {
        console.error(
          "Resposta inesperada ao criar componente:",
          response
        );

        alert("O componente pode não ter sido criado corretamente.");

        setIsSubmitting(false);
        return;
      }

      if (selectedEmp.length > 0) {
        await Promise.all(
          selectedEmp.map((user_id) =>
            createEmployeesComponents(component_id, user_id)
          )
        );
      }

      if (onCreated) {
        onCreated({
          component_id,
          component_name: recipe.recipe_name,
          start_date,
          deadline,
          status: "Pending",
          equipment_id,
          department_id,
          component_recipe_id: recipe.component_recipe_id,
        });
      }

      clearForms();
      setOpen(false);
    } catch (error) {
      console.error("Erro no submit:", error);
      alert("Ocorreu um erro ao salvar o componente.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          max-h-[90vh]
          w-full
          max-w-[720px]
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-[#DFE1E6]
          bg-white
          shadow-[0_8px_32px_rgba(9,30,66,0.20)]
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
            px-5
            py-4
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  bg-[#E9F2FF]
                  text-[#0052CC]
                "
              >
                <FiTool className="h-4 w-4" />
              </div>

              <h2
                className="
                  truncate
                  text-[17px]
                  font-semibold
                  tracking-[-0.01em]
                  text-[#172B4D]
                "
              >
                Novo Componente
              </h2>
            </div>

            <p className="mt-1 pl-10 text-xs text-[#5E6C84]">
              Adicione um componente ao quadro de produção.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="
              ml-4
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
              disabled:cursor-not-allowed
              disabled:opacity-50
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
            px-5
            py-5
          "
        >
          <div className="space-y-5">

            {/* COMPONENTE */}
            <section>
              <label
                className="
                  mb-1.5
                  block
                  text-[13px]
                  font-semibold
                  text-[#172B4D]
                "
              >
                Componente{" "}
                <span className="text-[#DE350B]">*</span>
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
            </section>

            {/* DATAS */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FiCalendar className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-[13px] font-semibold text-[#172B4D]">
                  Período de produção
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* DATA INICIAL */}
                <div>
                  <label
                    htmlFor="start-date"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Data inicial{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);

                      if (!endDate || endDate < e.target.value) {
                        setEndDate(e.target.value);
                      }
                    }}
                    required
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

                {/* HORA INICIAL */}
                <div>
                  <label
                    htmlFor="start-time"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Hora inicial{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <div className="relative">
                    <FiClock
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-[#97A0AF]
                      "
                    />

                    <input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="
                        h-10
                        w-full
                        rounded-md
                        border
                        border-[#DFE1E6]
                        bg-white
                        pl-10
                        pr-3
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

                {/* DATA FINAL */}
                <div>
                  <label
                    htmlFor="end-date"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Data final{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
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

                {/* HORA FINAL */}
                <div>
                  <label
                    htmlFor="end-time"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-medium
                      text-[#5E6C84]
                    "
                  >
                    Hora final{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <div className="relative">
                    <FiClock
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-[#97A0AF]
                      "
                    />

                    <input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="
                        h-10
                        w-full
                        rounded-md
                        border
                        border-[#DFE1E6]
                        bg-white
                        pl-10
                        pr-3
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
              </div>
            </section>

            {/* PROJETO / EQUIPAMENTO */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FiFolder className="h-4 w-4 text-[#0052CC]" />

                <h3 className="text-[13px] font-semibold text-[#172B4D]">
                  Alocação
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* PROJETO */}
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
                    Projeto{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <SelectMenu
                    variant="full"
                    maxSelections={1}
                    options={projects.map((project) => ({
                      id: project.project_id,
                      label: project.project_name,
                    }))}
                    selectedOption={selectedProj}
                    setSelectedOption={(value) => {
                      setSelectedProj(value);
                      setSelectedEquip([]);
                    }}
                  />
                </div>

                {/* EQUIPAMENTO */}
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
                    Equipamento{" "}
                    <span className="text-[#DE350B]">*</span>
                  </label>

                  <SelectMenu
                    variant="full"
                    maxSelections={1}
                    options={equipments
                      .filter(
                        (equipment) =>
                          Number(equipment.project_id) ===
                          Number(selectedProj[0])
                      )
                      .map((equipment) => ({
                        id: equipment.equipment_id,
                        label: equipment.equipment_name,
                      }))}
                    selectedOption={selectedEquip}
                    setSelectedOption={setSelectedEquip}
                  />
                </div>
              </div>
            </section>

            {/* DEPARTAMENTO */}
            <section>
              <label
                className="
                  mb-1.5
                  block
                  text-[13px]
                  font-semibold
                  text-[#172B4D]
                "
              >
                Departamento{" "}
                <span className="text-[#DE350B]">*</span>
              </label>

              <SelectMenu
                name="departament"
                variant="full"
                maxSelections={1}
                options={departmens.map((department) => ({
                  id: department.department_id,
                  label: department.department_name,
                }))}
                selectedOption={selectDept}
                setSelectedOption={setSelectedDept}
              />
            </section>

            {/* RESPONSÁVEIS */}
            <section>
              <div className="mb-1.5 flex items-center gap-2">
                <FiUsers className="h-4 w-4 text-[#5E6C84]" />

                <label
                  className="
                    text-[13px]
                    font-semibold
                    text-[#172B4D]
                  "
                >
                  Responsáveis{" "}
                  <span className="text-[#DE350B]">*</span>
                </label>
              </div>

              <SelectMenu
                variant="full"
                options={employees.map((employee) => ({
                  id: employee.user_id,
                  label: employee.user_name,
                }))}
                selectedOption={selectedEmp}
                setSelectedOption={setSelectedEmp}
              />
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
            justify-between
            border-t
            border-[#DFE1E6]
            bg-[#FAFBFC]
            px-5
            py-3
          "
        >
          <span className="hidden text-xs text-[#97A0AF] sm:block">
            <span className="text-[#DE350B]">*</span>{" "}
            Campos obrigatórios
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
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
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting ? "Criando..." : "Criar Componente"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

export default AddComponent;