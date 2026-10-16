import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import SelectMenu from "../../Ui/SelectMenu";

import { listMaterials } from "@services/MaterialService.js";
import { createCompRecipeMat } from "@services/ComponentRecipeMaterials.js";
import { createComponentRecipe } from "@services/ComponentRecipes.js";

export default function AddComponenteRecipeModal({ isVisible, setVisible }) {
  const [componenteRecipeName, setComponentRecipeName] = useState("");

  const queryClient = useQueryClient();

  const [men, setMen] = useState("");
  const [hours, setHours] = useState("");

  const [materials, setMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialsToAdd, setMaterialsToAdd] = useState([]);
  const [materialsQuantity, setMaterialsQuantity] = useState([]);

  useEffect(() => {
    const fletchMaterials = async () => {
      const data = await listMaterials();

      if (!Array.isArray(data) || data.length <= 0) {
        console.error("erro no array materiasl");
        return null;
      }

      setMaterials(data);
    };

    fletchMaterials();
  }, []);

  useEffect(() => {
    setMaterialsQuantity((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));

      const newItems = materialsList
        .filter((id) => !existingIds.has(id))
        .map((id) => ({ id, quantity: 1 }));

      return [...prev, ...newItems];
    });
  }, [materialsList]);

  const clearStates = () => {
    setComponentRecipeName("");
    setMen("");
    setHours("");
    setMaterialsList([]);
    setMaterialsToAdd([]);
    setMaterialsQuantity([]);
    setVisible(false);
  };

  const handleSave = async () => {
    try {
      if (
        materialsList.length === 0 ||
        componenteRecipeName === "" ||
        men === "" ||
        hours === ""
      ) {
        alert("Preencha todos os dados");
        return null;
      }

      const recipe_component = await createComponentRecipe(
        componenteRecipeName,
        Number(men),
        Number(hours),
      );

      const component_recipe_id = recipe_component[0].component_recipe_id;

      for (const m of materialsQuantity) {
        await createCompRecipeMat(
          component_recipe_id,
          m.id,
          Number(m.quantity),
        );
      }

      clearStates();
      queryClient.invalidateQueries(["components"]);
    } catch (err) {
      console.error("Erro ao salvar lista de materiais", err);
    }
  };

  const totalValue = materialsList.reduce((acc, id) => {
    const material = materials.find((m) => m.material_id === id);
    const itemQty = materialsQuantity.find((q) => q.id === id);

    const price = material ? Number(material.value) : 0;
    const quantity = itemQty ? Number(itemQty.quantity) : 0;

    return acc + price * quantity;
  }, 0);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-[#091E42]/45 p-6 backdrop-blur-[2px]">
      <div className="flex h-full w-[1100px] flex-col overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)  ]">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#172B4D]">
                Adicionar Receita do Componente
              </h2>

              <p className="mt-0.5 text-[11px] text-[#6B778C]">
                Cadastre um novo componente e defina seus materiais.
              </p>
            </div>

            <button
              type="button"
              onClick={clearStates}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-md
                text-[#5E6C84]
                transition
                hover:bg-[#F4F5F7]
                hover:text-[#172B4D]
              "
            >
              <IoMdClose size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5">
            <div className="shrink-0 space-y-5">
              {/* DADOS DO COMPONENTE */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* NOME */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                    Nome <span className="text-[#DE350B]">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Digite o nome do componente"
                    value={componenteRecipeName}
                    onChange={(e) => setComponentRecipeName(e.target.value)}
                    required
                    className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    bg-white px-3
                    text-xs text-[#172B4D]
                    outline-none
                    transition
                    placeholder:text-[#97A0AF]
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                  />
                </div>

                {/* HOMENS */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                      Qtd. Homens <span className="text-[#DE350B]">*</span>
                    </label>

                    <input
                      type="number"
                      placeholder="Ex: 2"
                      value={men}
                      onChange={(e) => setMen(e.target.value)}
                      min="1"
                      required
                      className="
                      h-9 w-full rounded-md
                      border border-[#DFE1E6]
                      bg-white px-3
                      text-xs text-[#172B4D]
                      outline-none
                      transition
                      placeholder:text-[#97A0AF]
                      focus:border-[#4C9AFF]
                      focus:ring-2
                      focus:ring-[#DEEBFF]
                    "
                    />
                  </div>

                  {/* HORAS */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                      Qtd. Horas <span className="text-[#DE350B]">*</span>
                    </label>

                    <input
                      type="number"
                      placeholder="Ex: 1.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      step="0.1"
                      min="0"
                      required
                      className="
                      h-9 w-full rounded-md
                      border border-[#DFE1E6]
                      bg-white px-3
                      text-xs text-[#172B4D]
                      outline-none
                      transition
                      placeholder:text-[#97A0AF]
                      focus:border-[#4C9AFF]
                      focus:ring-2
                      focus:ring-[#DEEBFF]
                    "
                    />
                  </div>
                </div>
              </div>

              {/* MATERIAIS */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Materiais <span className="text-[#DE350B]">*</span>
                </label>

                <SelectMenu
                  variant="full"
                  options={materials
                    .filter((m) => !materialsList.includes(m.material_id))
                    .map((m) => ({
                      id: m.material_id,
                      label: m.material_name,
                    }))}
                  selectedOption={materialsToAdd}
                  setSelectedOption={setMaterialsToAdd}
                  closeOnSelect={false}
                  searchable
                  searchPlaceholder="Pesquisar material..."
                  confirmOnEnter
                  onConfirmSelection={(selected) => {
                    setMaterialsList((prev) => [
                      ...prev,
                      ...selected.filter((id) => !prev.includes(id)),
                    ]);

                    setMaterialsToAdd([]);
                  }}
                />
              </div>
            </div>
            {/* TABELA */}
            <div className="mt-4 min-h-[360px] min-w-0 flex-1 overflow-hidden rounded-md border border-[#DFE1E6] bg-white">
              <div className="h-full min-h-0 overflow-auto">
                <table className="w-full table-fixed text-xs">
                  <thead className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                    <tr>
                      <th className="w-[20%] px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Material
                      </th>

                      <th className="w-[23%] px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Descrição
                      </th>

                      <th className="w-[15%] px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Valor Unitário
                      </th>

                      <th className="w-[14%] px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Quantidade
                      </th>

                      <th className="w-[15%] px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Valor Total
                      </th>

                      <th className="w-[13%] px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {materialsList.length > 0 ? (
                      materialsList.map((id) => {
                        const found = materials.find(
                          (m) => m.material_id === id,
                        );

                        const quantity =
                          materialsQuantity.find((m) => m.id === id)
                            ?.quantity || 0;

                        const unitValue = found ? Number(found.value) : 0;

                        const totalItem = quantity * unitValue;

                        return (
                          <tr
                            key={id}
                            className={`border-b border-[#DFE1E6] last:border-b-0 transition-colors ${materialsList.indexOf(id) % 2 === 0
                                ? "bg-white hover:bg-[#EBECF0]"
                                : "bg-[#F4F5F7] hover:bg-[#EBECF0]"
                              }`}
                          >
                            {/* MATERIAL */}
                            <td className="truncate px-3 py-1 text-left text-[11px] font-medium text-[#172B4D]">
                              {found?.material_name ?? "-"}
                            </td>

                            {/* DESCRIÇÃO */}
                            <td className="truncate px-3 py-1 text-left text-[11px] text-[#6B778C]">
                              {found?.material_desc ?? "-"}
                            </td>

                            {/* VALOR UNITÁRIO */}
                            <td className="px-3 py-1  text-left text-[11px] text-[#42526E]">
                              {unitValue.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>

                            {/* QUANTIDADE */}
                            <td className="px-3 py-1 text-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={quantity}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (!/^\d*\.?\d*$/.test(value)) {
                                    return;
                                  }

                                  setMaterialsQuantity((prev) =>
                                    prev.map((m) =>
                                      m.id === id
                                        ? {
                                          ...m,
                                          quantity: value,
                                        }
                                        : m,
                                    ),
                                  );
                                }}
                                className="
                                  h-7 w-20 rounded-md
                                  border border-[#DFE1E6]
                                  bg-white px-2
                                  text-center text-[11px]
                                  text-[#172B4D]
                                  outline-none
                                  transition
                                  focus:border-[#4C9AFF]
                                  focus:ring-2
                                  focus:ring-[#DEEBFF]
                                "
                              />
                            </td>

                            {/* VALOR TOTAL */}
                            <td className="px-3 py-1 text-left text-[11px] font-medium text-[#172B4D]">
                              {totalItem.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>

                            {/* AÇÃO */}
                            <td className="px-3 py-1 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setMaterialsList(
                                    materialsList.filter((i) => i !== id),
                                  );
                                }}
                                className="
                                  rounded-md
                                  px-2 py-1
                                  text-[10px] font-medium
                                  text-[#DE350B]
                                  transition
                                  hover:bg-[#FFEBE6]
                                "
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center text-[11px] text-[#6B778C]"
                        >
                          Nenhum material selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTAL */}
            <div className="flex justify-end">
              <div className="rounded-md border border-[#DFE1E6] bg-[#FAFBFC] px-4 py-2">
                <span className="mr-2 text-[11px] text-[#6B778C]">Total:</span>

                <span className="text-xs font-semibold text-[#172B4D]">
                  {totalValue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3">
            <button
              type="button"
              onClick={clearStates}
              className="
                h-8 rounded-md
                border border-[#DFE1E6]
                bg-white px-3
                text-[11px] font-medium
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
                h-8 rounded-md
                bg-[#0052CC] px-3.5
                text-[11px] font-semibold
                text-white
                transition
                hover:bg-[#0065FF]
                active:scale-[0.98]
              "
            >
              Salvar Receita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
