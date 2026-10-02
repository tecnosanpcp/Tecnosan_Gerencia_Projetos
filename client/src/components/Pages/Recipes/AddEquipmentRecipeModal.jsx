import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { parseBRL } from "../../../utils/IntUtils";

import SelectMenu from "../../Ui/SelectMenu";

import { VerifyAuth } from "@services/AuthService.js";
import { vwComponentRecipeMaterials } from "@services/ViewsService.js";
import { createEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { createEquipRecipeCompRecipe } from "@services/EquipRecipeCompRecipe.js";

export default function AddEquipmentRecipeModal({ isVisible, setVisible }) {
  const [equipmentRecipeName, setEquipmentRecipeName] = useState("");
  const [componentsRecipes, setComponentsRecipes] = useState([]);
  const [componentsRecipeList, setComponentRecipeList] = useState([]);
  const [componentsRecipeToAdd, setComponentsRecipeToAdd] = useState([]);
  const [componentsRecipeQuantity, setComponentsRecipeQuantity] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fletchComponentsRecipes = async () => {
      await VerifyAuth();

      const data = await vwComponentRecipeMaterials();

      setComponentsRecipes(data);
    };

    fletchComponentsRecipes();
  }, []);

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

  const handleSave = async () => {
    try {
      if (componentsRecipeList.length === 0 || equipmentRecipeName === "") {
        alert("Preencha todos os dados");
        return null;
      }

      const recipe_equipment = await createEquipmentRecipe(equipmentRecipeName);

      const equipment_recipe_id = recipe_equipment[0].equipment_recipe_id;

      for (const er_cr of componentsRecipeQuantity) {
        await createEquipRecipeCompRecipe(
          equipment_recipe_id,
          er_cr.id,
          er_cr.quantity,
        );
      }

      clearStates();

      queryClient.invalidateQueries(["equipments"]);
    } catch (err) {
      console.error("Erro ao salvar lista de componentes", err);
    }
  };

  const totalValue = componentsRecipeList.reduce((acc, id) => {
    const item = componentsRecipes.find((m) => m.component_recipe_id === id);

    const qtyObj = componentsRecipeQuantity.find((q) => q.id === id);

    const price = item ? Number(item.total_value) : 0;
    const quantity = qtyObj ? Number(qtyObj.quantity) : 0;

    return acc + price * quantity;
  }, 0);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/45 p-4 backdrop-blur-[2px]">
      <div className="flex h-full w-[1100px] flex-col overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)]">
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
                Adicionar Receita do Equipamento
              </h2>

              <p className="mt-0.5 text-[11px] text-[#6B778C]">
                Cadastre uma receita e associe os componentes necessários.
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
              {/* CAMPOS PRINCIPAIS */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* NOME */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                    Nome <span className="text-[#DE350B]">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Digite o nome da receita"
                    value={equipmentRecipeName}
                    onChange={(e) => setEquipmentRecipeName(e.target.value)}
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

                {/* COMPONENTES */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                    Componentes <span className="text-[#DE350B]">*</span>
                  </label>

                  <SelectMenu
                    variant="full"
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
                    closeOnSelect={false}
                    searchable
                    searchPlaceholder="Pesquisar componente..."
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
            <div className="mt-4 min-h-[360px] min-w-0 flex-1 overflow-hidden rounded-lg border border-[#DFE1E6] bg-white">
              <div className="border-b border-[#DFE1E6] bg-[#F4F5F7] px-4 py-2.5">
                <p className="text-[11px] font-semibold text-[#172B4D]">
                  Componentes selecionados
                </p>
              </div>

              <div className="h-full min-h-0 overflow-auto">
                <table className="w-full table-fixed">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-[#DFE1E6]">
                      <th className="w-[25%] px-3 py-1 text-left text-[10px] font-semibold text-[#5E6C84]">
                        Componente
                      </th>

                      <th className="w-[15%] px-3 py-1 text-center text-[10px] font-semibold text-[#5E6C84]">
                        Horas-Homem
                      </th>

                      <th className="w-[15%] px-3 py-1 text-center text-[10px] font-semibold text-[#5E6C84]">
                        Valor Unitário
                      </th>

                      <th className="w-[15%] px-3 py-1 text-center text-[10px] font-semibold text-[#5E6C84]">
                        Quantidade
                      </th>

                      <th className="w-[15%] px-3 py-1 text-center text-[10px] font-semibold text-[#5E6C84]">
                        Valor Total
                      </th>

                      <th className="w-[15%] px-3 py-1 text-center text-[10px] font-semibold text-[#5E6C84]">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {componentsRecipeList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-[11px] text-[#97A0AF]"
                        >
                          Nenhum componente selecionado.
                        </td>
                      </tr>
                    ) : (
                      componentsRecipeList.map((id) => {
                        const found = componentsRecipes.find(
                          (m) => m.component_recipe_id === id,
                        );

                        const qtdFind = componentsRecipeQuantity.find(
                          (c) => c.id == id,
                        );

                        return (
                          <tr
                            key={id}
                            className={`border-b border-[#DFE1E6] last:border-b-0 transition-colors ${
                              componentsRecipeList.indexOf(id) % 2 === 0
                                ? "bg-white hover:bg-[#EBECF0]"
                                : "bg-[#F4F5F7] hover:bg-[#EBECF0]"
                            }`}
                          >
                            <td className="truncate px-3 py-1 text-left text-[10px] text-[#172B4D]">
                              {found?.recipe_name ?? "-"}
                            </td>

                            <td className="px-3 py-1 text-center text-[10px] text-[#42526E]">
                              {found?.horas_homem ?? "-"}
                            </td>

                            <td className="px-3 py-1 text-center text-[10px] text-[#42526E]">
                              {parseBRL(found?.total_value) ?? parseBRL(0)}
                            </td>

                            <td className="px-3 py-1 text-center">
                              <input
                                type="number"
                                min="0"
                                className="
                                h-6 w-12 rounded
                                border border-[#DFE1E6]
                                text-center text-[9.7px]
                                outline-none
                                focus:border-[#4C9AFF]
                              "
                                value={
                                  componentsRecipeQuantity.find(
                                    (m) => m.id === id,
                                  )?.quantity || ""
                                }
                                onChange={(e) => {
                                  const newValue = e.target.value;

                                  setComponentsRecipeQuantity((prev) =>
                                    prev.map((m) =>
                                      m.id === id
                                        ? {
                                            ...m,
                                            quantity: parseInt(newValue) || 0,
                                          }
                                        : m,
                                    ),
                                  );
                                }}
                              />
                            </td>

                            <td className="px-3 py-1 text-center text-[11px] font-medium text-[#172B4D]">
                              {parseBRL(
                                qtdFind?.quantity * found?.total_value,
                              ) ?? parseBRL(0)}
                            </td>

                            <td className="px-3 py-1 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setComponentRecipeList(
                                    componentsRecipeList.filter((i) => i != id),
                                  );

                                  setComponentsRecipeQuantity((prev) =>
                                    prev.filter((item) => item.id != id),
                                  );
                                }}
                                className="
                                  rounded-md
                                  px-2 py-1
                                  text-[10px]
                                  font-medium
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
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3">
            <div className="mr-auto rounded-md border border-[#DFE1E6] bg-white px-3 py-1.5">
              <span className="text-[10px] text-[#6B778C]">Total</span>

              <span className="ml-2 text-xs font-semibold text-[#172B4D]">
                {parseBRL(totalValue)}
              </span>
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
