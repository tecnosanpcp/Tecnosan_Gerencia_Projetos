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
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedRecipe.length === 0 || !quantity || parseInt(quantity) <= 0) {
      alert("Selecione pelo menos uma receita e defina a quantidade.");
      return;
    }

    onConfirm(selectedRecipe, parseInt(quantity));
    setSelectedRecipe([]);
    setQuantity("");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit}>
        <div
          className="
            relative
            w-[420px]
            max-w-[calc(100vw-32px)]
            rounded-xl
            border border-[#DFE1E6]
            bg-white
            p-6
            shadow-2xl
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#172B4D]">
                Novo Equipamento
              </h2>

              <p className="mt-1 text-xs text-[#6B778C]">
                Adicione um novo equipamento ao projeto.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-md
                text-[#6B778C]
                transition
                hover:bg-[#F4F5F7]
                hover:text-[#DE350B]
              "
              aria-label="Fechar"
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="mt-5 flex flex-col gap-5">
            {/* Receita */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#172B4D]">
                Selecione a Receita (Modelo)
              </label>

              <SelectMenu
                selectedOption={selectedRecipe}
                setSelectedOption={setSelectedRecipe}
                maxSelections={0}
                variant="full"
                closeOnSelect={false}
                searchable={true}
                searchPlaceholder="Pesquisar receita..."
                confirmOnEnter={true}
                options={recipesList.map((recipe) => ({
                  id: recipe.equipment_recipe_id,
                  label: `${recipe.recipe_name} (${recipe.total_hours || 0}h)`,
                }))}
              />
            </div>

            {/* Quantidade */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#172B4D]">
                Escolha a Quantidade
              </label>

              <input
                type="number"
                min="1"
                placeholder="Digite a quantidade"
                className="
                  w-full
                  rounded-md
                  border border-[#DFE1E6]
                  bg-white
                  px-3
                  py-2
                  text-sm
                  text-[#172B4D]
                  outline-none
                  transition
                  placeholder:text-[#97A0AF]
                  focus:border-[#0052CC]
                  focus:ring-2
                  focus:ring-[#0052CC]/10
                "
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-[#DFE1E6] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-md
                border border-[#DFE1E6]
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-[#42526E]
                transition
                hover:bg-[#F4F5F7]
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                rounded-md
                bg-[#0052CC]
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-[#0747A6]
                active:bg-[#003884]
              "
            >
              Adicionar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
