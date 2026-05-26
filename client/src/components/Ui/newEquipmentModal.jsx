import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import SelectMenu from "./SelectMenu";

export default function NewEquipmentModal({
  isVisible,
  onClose,
  onConfirm,
  recipesList,
}) {
  const [selectedRecipe, setSelectedRecipe] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = () => {
    if (!selectedRecipe || !quantity || parseInt(quantity) <= 0) {
      alert("Selecione uma receita e defina a quantidade.");
      return;
    }

    onConfirm(selectedRecipe[0], parseInt(quantity));
    setSelectedRecipe("");
    setQuantity("");
    // window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-screen h-screen">
      <div className="card w-96 flex flex-col gap-4 bg-white p-6 rounded shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-bold text-lg">Novo Equipamento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Selecione a Receita (Modelo)
            </label>
            <SelectMenu
              selectedOption={selectedRecipe}
              setSelectedOption={setSelectedRecipe}
              maxSelections={1}
              variant="full"
              options={recipesList.map((recipe) => ({
                id: recipe.equipment_recipe_id,
                label: `${recipe.recipe_name} (${recipe.total_hours || 0}h)`,
              }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Escolha a Quantidade</label>
            <input
              type="number"
              placeholder="Digite a quantidade"
              className="border p-2 rounded"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="bnt">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="bnt-add">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
