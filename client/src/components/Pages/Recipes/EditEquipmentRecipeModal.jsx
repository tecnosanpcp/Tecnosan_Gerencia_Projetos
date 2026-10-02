import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import { parseBRL } from "../../../utils/IntUtils";

import SelectMenu from "../../Ui/SelectMenu";

import { vwComponentRecipeMaterials } from "@services/ViewsService.js";
import { updateEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import {
  readEquipRecipeCompRecipeById,
  createEquipRecipeCompRecipe,
  updateEquipRecipeCompRecipe,
  deleteEquipRecipeCompRecipe,
} from "@services/EquipRecipeCompRecipe.js";

export default function EditEquipmentRecipeModal({
  isVisible,
  setVisible,
  equipment,
}) {
  const [equipmentRecipeName, setEquipmentRecipeName] = useState("");

  const [componentsRecipes, setComponentsRecipes] = useState([]);

  const [componentsRecipeList, setComponentRecipeList] = useState([]);
  const [componentsRecipeToAdd, setComponentsRecipeToAdd] = useState([]);

  const [componentsRecipeQuantity, setComponentsRecipeQuantity] = useState([]);

  const [quantityBackUp, setQuantityBackUp] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchComponentsRecipes = async () => {
      try {
        const data = await vwComponentRecipeMaterials();

        if (Array.isArray(data)) {
          setComponentsRecipes(data);
        }
      } catch (err) {
        console.error("Erro ao buscar materiais:", err);
      }
    };

    if (isVisible) {
      fetchComponentsRecipes();
    }
  }, [isVisible]);

  useEffect(() => {
    const loadDataInit = async () => {
      if (!equipment) return;

      const nome =
        equipment?.Equipamento || equipment?.["Nome do Equipamento"] || "";

      setEquipmentRecipeName(nome);

      if (!equipment?.ID) return;

      try {
        const data = await readEquipRecipeCompRecipeById(equipment.ID);

        let IDs = [];
        let quantity = [];

        if (Array.isArray(data)) {
          for (const element of data) {
            IDs.push(element.component_recipe_id);

            quantity.push({
              id: element.component_recipe_id,
              quantity: Number(element.quantity_plan),
            });
          }

          setComponentRecipeList(IDs);
          setQuantityBackUp(quantity);
          setComponentsRecipeQuantity(quantity);
        }
      } catch (error) {
        console.error("Erro ao carregar itens da receita:", error);
      }
    };

    if (isVisible && equipment) {
      loadDataInit();
    }
  }, [equipment, isVisible]);

  useEffect(() => {
    setComponentsRecipeQuantity((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));

      const newItems = componentsRecipeList
        .filter((id) => !existingIds.has(id))
        .map((id) => ({
          id,
          quantity: 1,
        }));

      return [...prev, ...newItems];
    });
  }, [componentsRecipeList]);

  const clearStates = () => {
    setEquipmentRecipeName("");
    setComponentRecipeList([]);
    setComponentsRecipeToAdd([]);
    setComponentsRecipeQuantity([]);
    setVisible(false);
  };

  const handleEdit = async () => {
    try {
      if (!equipment || !equipment.ID) {
        alert("Erro: Equipamento não identificado.");
        return;
      }

      if (!equipmentRecipeName || componentsRecipeList.length <= 0) {
        alert("Preencha todos os dados obrigatórios.");
        return;
      }

      await updateEquipmentRecipe(equipment.ID, equipmentRecipeName);

      const quantities = componentsRecipeList.map((id) => {
        const item = componentsRecipeQuantity.find((q) => q.id === id);

        return {
          id,
          quantity: item ? Number(item.quantity) : 1,
        };
      });

      for (const item of quantities) {
        const old = quantityBackUp.find((b) => b.id === item.id);

        if (!old) {
          await createEquipRecipeCompRecipe(
            equipment.ID,
            item.id,
            item.quantity,
          );
        } else if (old.quantity !== item.quantity) {
          await updateEquipRecipeCompRecipe(
            equipment.ID,
            item.id,
            item.quantity,
          );
        }
      }

      for (const oldItem of quantityBackUp) {
        const stillExists = quantities.some((e) => e.id === oldItem.id);

        if (!stillExists) {
          await deleteEquipRecipeCompRecipe(equipment.ID, oldItem.id);
        }
      }

      queryClient.invalidateQueries(["equipments"]);
      clearStates();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const totalValue = componentsRecipeList.reduce((acc, id) => {
    const item = componentsRecipes.find((c) => c.component_recipe_id === id);

    const qtyObj = componentsRecipeQuantity.find((q) => q.id === id);

    const price = item ? Number(item.total_value) : 0;

    const quantity = qtyObj ? Number(qtyObj.quantity) : 0;

    return acc + price * quantity;
  }, 0);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-[#091E42]/45 p-4 backdrop-blur-[2px]">
      <div className="flex h-full w-[1100px] flex-col overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)  ]">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#172B4D]">
                Editar Receita do Equipamento
              </h2>

              <p className="mt-0.5 text-[11px] text-[#6B778C]">
                Configure os componentes utilizados pelo equipamento.
              </p>
            </div>

            <button
              type="button"
              onClick={clearStates}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-md
                text-[#5E6C84]
                hover:bg-[#F4F5F7]
              "
            >
              <IoMdClose size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5">
            <div className="shrink-0 space-y-4">
              {/* DADOS PRINCIPAIS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                    Nome <span className="text-[#DE350B]">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Nome do equipamento"
                    value={equipmentRecipeName}
                    onChange={(e) => setEquipmentRecipeName(e.target.value)}
                    required
                    className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    px-3 text-xs
                    outline-none
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                    Componentes <span className="text-[#DE350B]">*</span>
                  </label>

                  <SelectMenu
                    options={componentsRecipes
                      .filter(
                        (m) =>
                          !componentsRecipeList.includes(m.component_recipe_id),
                      )
                      .map((m) => ({
                        id: m.component_recipe_id,
                        label: m.recipe_name,
                      }))}
                    selectedOption={componentsRecipeToAdd}
                    setSelectedOption={setComponentsRecipeToAdd}
                    searchable
                    searchPlaceholder="Pesquisar componente..."
                    keepOpenOnSelect
                    confirmOnEnter
                    onConfirmSelection={(selected) => {
                      setComponentRecipeList((prev) => [
                        ...prev,
                        ...selected.filter((id) => !prev.includes(id)),
                      ]);

                      setComponentsRecipeToAdd([]);
                    }}
                  />
                </div>
              </div>
            </div>
            {/* TABELA */}
            <div className="mt-4 min-h-[360px] min-w-0 flex-1 overflow-hidden rounded-lg border border-[#DFE1E6]">
              <div className="h-full min-h-0 overflow-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#F4F5F7]">
                    <tr className="border-b border-[#DFE1E6]">
                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Componente
                      </th>

                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Horas-Homem
                      </th>

                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Valor Unitário
                      </th>

                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Quantidade
                      </th>

                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Total
                      </th>

                      <th className="px-3 py-1 text-[10px] font-semibold text-[#5E6C84]">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {componentsRecipeList.map((id) => {
                      if (!componentsRecipes.length) {
                        return null;
                      }

                      const found = componentsRecipes.find(
                        (m) => m.component_recipe_id === id,
                      );

                      const qtdObj = componentsRecipeQuantity.find(
                        (c) => c.id === id,
                      );

                      const currentQtd = qtdObj ? qtdObj.quantity : "";

                      return (
                        <tr
                          key={id}
                          className="
                            border-b
                            border-[#F0F1F3]
                            last:border-b-0
                            odd:bg-white
                            even:bg-[#F4F5F7]
                            hover:bg-[#EBECF0]
                          "
                        >
                          <td className="px-3 py-1 text-[10px] font-medium text-[#172B4D]">
                            {found?.recipe_name ?? "-"}
                          </td>

                          <td className="px-3 py-1 text-[9.7px] text-[#6B778C]">
                            {found?.horas_homem ?? "-"}
                          </td>

                          <td className="px-3 py-1 text-[9.7px] text-[#42526E]">
                            {parseBRL(found?.total_value)}
                          </td>

                          <td className="px-3 py-1">
                            <input
                              type="number"
                              min="0"
                              value={currentQtd}
                              onChange={(e) => {
                                const value = e.target.value;

                                setComponentsRecipeQuantity((prev) =>
                                  prev.map((m) =>
                                    m.id === id
                                      ? {
                                          ...m,
                                          quantity:
                                            value === "" ? 0 : Number(value),
                                        }
                                      : m,
                                  ),
                                );
                              }}
                              className="
                                h-6 w-12 rounded
                                border border-[#DFE1E6]
                                text-center text-[9.7px]
                                outline-none
                                focus:border-[#4C9AFF]
                              "
                            />
                          </td>

                          <td className="px-3 py-2 text-[10px] font-medium text-[#172B4D]">
                            {parseBRL(
                              (currentQtd || 0) * (found?.total_value || 0),
                            )}
                          </td>

                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                setComponentRecipeList((prev) =>
                                  prev.filter((item) => item !== id),
                                )
                              }
                              className="text-[10px] font-medium text-[#DE350B] hover:underline"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3">
            <div className="mr-auto rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-[#172B4D]">
              Total: {parseBRL(totalValue)}
            </div>

            <button
              type="button"
              onClick={clearStates}
              className="
                h-8 rounded-md
                border border-[#DFE1E6]
                bg-white px-3
                text-[11px] font-medium
                text-[#42526E]
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
                hover:bg-[#0065FF]
              "
            >
              Salvar Receita
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
