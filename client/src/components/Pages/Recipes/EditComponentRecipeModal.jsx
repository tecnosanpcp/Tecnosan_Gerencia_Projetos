import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import SelectMenu from "../../Ui/SelectMenu";

import { listMaterials } from "@services/MaterialService.js";
import { updateComponentRecipe } from "@services/ComponentRecipes.js";
import {
  createCompRecipeMat,
  readCompRecipeMatByComp,
  updateCompRecipeMat,
  deleteCompRecipeMat,
} from "@services/ComponentRecipeMaterials.js";

const parseBRL = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return "R$ 0,00";
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function EditComponentRecipeModal({
  isVisible,
  setVisible,
  component,
}) {
  const [componenteRecipeName, setComponentRecipeName] = useState("");
  const [totalEmployees, setTotalEmployees] = useState(1);
  const [totalHours, setTotalHours] = useState(0);

  const [materials, setMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialsToAdd, setMaterialsToAdd] = useState([]);
  const [materialsQuantity, setMaterialsQuantity] = useState([]);
  const [materialsQuantityBackUp, setMaterialsQuantityBackUp] = useState([]);
  const [componentsRecipeToAdd, setComponentsRecipeToAdd] = useState([]);
  const [componentsRecipeList, setComponentRecipeList] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await listMaterials();

        if (Array.isArray(data)) {
          setMaterials(data);
        }
      } catch (err) {
        console.error("Erro ao buscar materiais:", err);
      }
    };

    if (isVisible) {
      fetchMaterials();
    }
  }, [isVisible]);

  useEffect(() => {
    const loadInit = async () => {
      if (!component) return;

      setComponentRecipeName(component.Componente ?? "");

      const rawFunc = component["Total Funcionários"];
      const rawHoras = component["Total Horas"];
      const rawManHours = component["Horas-Homens"] || component["Horas Homem"];

      let valFunc = 1;
      let valHoras = 0;

      if (rawFunc !== undefined && rawHoras !== undefined) {
        valFunc = Number(rawFunc);
        valHoras = Number(rawHoras);
      } else {
        valFunc = 1;
        valHoras = Number(rawManHours);
      }

      setTotalEmployees(isNaN(valFunc) || valFunc <= 0 ? 1 : valFunc);

      setTotalHours(isNaN(valHoras) ? 0 : valHoras);

      if (!component?.ID) return;

      try {
        const data = await readCompRecipeMatByComp(component.ID);

        let ids = [];
        let qty = [];

        if (Array.isArray(data)) {
          for (const element of data) {
            ids.push(element.material_id);

            qty.push({
              id: element.material_id,
              quantity: Number(element.quantity_plan) || 0,
            });
          }

          setMaterialsList(ids);
          setMaterialsQuantityBackUp(qty);
          setMaterialsQuantity(qty);
        }
      } catch (error) {
        console.error("Erro ao carregar itens da receita:", error);
      }
    };

    if (isVisible && component) {
      loadInit();
    }
  }, [component, isVisible]);

  useEffect(() => {
    setMaterialsQuantity((prev) => {
      const exist = new Set(prev.map((p) => p.id));

      const newItems = materialsList
        .filter((id) => !exist.has(id))
        .map((id) => ({
          id,
          quantity: 1,
        }));

      return [...prev, ...newItems];
    });
  }, [materialsList]);

  const clearStates = () => {
    setComponentRecipeName("");
    setTotalEmployees(1);
    setTotalHours(0);
    setMaterialsList([]);
    setMaterialsToAdd([]);
    setMaterialsQuantity([]);
    setMaterialsQuantityBackUp([]);
    setVisible(false);
  };

  const handleSave = async () => {
    try {
      if (!component || !component.ID) {
        alert("Erro: Componente não identificado.");
        return;
      }

      if (
        !componenteRecipeName ||
        totalEmployees <= 0 ||
        materialsList.length <= 0
      ) {
        alert("Preencha todos os dados obrigatórios corretamente.");
        return;
      }

      const safeEmployees = Number(totalEmployees) || 1;
      const safeHours = Number(totalHours) || 0;

      await updateComponentRecipe(
        component.ID,
        componenteRecipeName,
        safeEmployees,
        safeHours,
      );

      const quantities = materialsList.map((id) => {
        const item = materialsQuantity.find((q) => q.id === id);

        return {
          id,
          quantity: item ? Number(item.quantity) : 1,
        };
      });

      for (const item of quantities) {
        const old = materialsQuantityBackUp.find((x) => x.id === item.id);

        if (!old) {
          await createCompRecipeMat(component.ID, item.id, item.quantity);
        } else if (old.quantity !== item.quantity) {
          await updateCompRecipeMat(component.ID, item.id, item.quantity);
        }
      }

      for (const oldItem of materialsQuantityBackUp) {
        const stillExists = quantities.some((x) => x.id === oldItem.id);

        if (!stillExists) {
          await deleteCompRecipeMat(component.ID, oldItem.id);
        }
      }

      clearStates();
      queryClient.invalidateQueries(["components"]);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar. Verifique o console.");
    }
  };

  const totalValue = materialsList.reduce((acc, id) => {
    const material = materials.find((m) => m.material_id === id);

    const itemQty = materialsQuantity.find((q) => q.id === id);

    const price = material ? Number(material.value) : 0;
    const quantity = itemQty ? Number(itemQty.quantity) : 0;

    return acc + price * quantity;
  }, 0);

  if (!isVisible || !component) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/45 p-6 backdrop-blur-[2px]">
      <div className="flex h-full w-[1100px] flex-col overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)  ]">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#172B4D]">
                Editar Receita do Componente
              </h2>

              <p className="mt-0.5 text-[11px] text-[#6B778C]">
                Configure os materiais e informações da receita.
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
          <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto px-5 py-5">
            {/* DADOS PRINCIPAIS */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Nome <span className="text-[#DE350B]">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Nome do componente"
                  value={componenteRecipeName}
                  onChange={(e) => setComponentRecipeName(e.target.value)}
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

              <div className="col-span-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Funcionários <span className="text-[#DE350B]">*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(e.target.value)}
                  required
                  className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    px-3 text-xs text-center
                    outline-none
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                />
              </div>

              <div className="col-span-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Total de Horas <span className="text-[#DE350B]">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  required
                  className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    px-3 text-xs text-center
                    outline-none
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                />
              </div>
            </div>

            {/* MATERIAIS */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Materiais <span className="text-[#DE350B]">*</span>
              </label>

              <SelectMenu
                variant="full"
                options={(materials || [])
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

            {/* TABELA */}
            <div className="mt-4 min-h-[360px] min-w-0 flex-1 overflow-hidden rounded-lg border border-[#DFE1E6]">
              <div className="h-full min-h-0 overflow-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#F4F5F7]">
                    <tr className="border-b border-[#DFE1E6]">
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Material
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Descrição
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Valor Unitário
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Quantidade
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Total
                      </th>
                      <th className="px-3 py-2 text-[10px] font-semibold text-[#5E6C84]">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {materialsList.map((id) => {
                      if (!materials?.length) return null;

                      const mat = materials.find((m) => m.material_id === id);

                      const objQty = materialsQuantity.find((m) => m.id === id);

                      const currentQtd = objQty ? objQty.quantity : 0;

                      const unitValue = Number(mat?.value) || 0;

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
                          <td className="px-3 py-1 text-[11px] font-medium text-[#172B4D]">
                            {mat?.material_name ?? "-"}
                          </td>

                          <td className="px-3 py-1 text-[10px] text-[#6B778C]">
                            {mat?.material_desc ?? "-"}
                          </td>

                          <td className="px-3 py-1 text-[10px] text-[#42526E]">
                            {parseBRL(unitValue)}
                          </td>

                          <td className="px-3 py-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={currentQtd}
                              onKeyDown={(e) => {
                                if (e.key === ",") {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                if (!/^\d*(\.\d*)?$/.test(value)) {
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
                                h-6 w-12 rounded
                                border border-[#DFE1E6]
                                text-center text-[9.7px]
                                outline-none
                                focus:border-[#4C9AFF]
                              "
                            />
                          </td>


                          <td className="px-3 py-1 text-[10px] font-medium text-[#172B4D]">
                            {parseBRL(currentQtd * unitValue)}
                          </td>

                          <td className="px-3 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setMaterialsList((list) =>
                                  list.filter((x) => x !== id),
                                );

                                setMaterialsQuantity((prev) =>
                                  prev.filter((x) => x.id !== id),
                                );
                              }}
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
    </div>
  );
}
