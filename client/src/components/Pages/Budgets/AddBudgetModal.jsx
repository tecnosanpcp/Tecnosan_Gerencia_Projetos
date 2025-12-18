import PropTypes from "prop-types";
import { useState } from "react";
import {createBudget} from "@services/BudgetService.js";

function AddBudgetModal({ isOpen, setOpen }) {
  const [budget_name, set_budget_name] = useState("");
  const [budget_local, set_budget_local] = useState("");
  const [budget_desc, set_budget_desc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createBudget(1, budget_name, budget_desc, "Running")
      .then((newBudget) => {
        console.log("Orçamento criado com sucesso:", newBudget);
        setOpen(false);
      })
      .catch((error) => {
        console.error("Erro ao criar orçamento:", error);
      });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md w-1/3"
            onSubmit={handleSubmit}
          >
            <h1 className="text-base font-semibold text-gray-800 align-middle text-center">Adicionar Orçamento</h1>
            <div className="flex flex-col space-y-4 ">
              <label htmlFor="projectName" className="font-semibold">
                Nome do Orçamento
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                className="border border-gray-300 p-2 rounded"
                value={budget_name}
                onChange={(e) => set_budget_name(e.target.value)}
              />
              <label
                htmlFor="projectLocation"
                className="font-semibold"
              >
                Localização do Projeto
              </label>
              <input
                type="text"
                id="projectLocation"
                name="projectLocation"
                className="border border-gray-300 p-2 rounded"
                value={budget_local}
                onChange={(e) => set_budget_local(e.target.value)}
              />
              <label htmlFor="description" className="font-semibold">
                Descrição do Orçamento
              </label>
              <textarea
                id="description"
                name="description"
                className="border border-gray-300 p-2 rounded"
                value={budget_desc}
                onChange={(e) => set_budget_desc(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Adicionar Projeto
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

AddBudgetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default AddBudgetModal;
