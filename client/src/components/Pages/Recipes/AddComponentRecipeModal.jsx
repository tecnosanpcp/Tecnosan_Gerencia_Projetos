import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";

import SelectMenu from "../../Ui/SelectMenu";

import { listMaterials } from "@services/MaterialService.js";
import { createCompRecipeMat } from "@services/ComponentRecipeMaterials.js";
import { createComponentRecipe } from "@services/ComponentRecipes.js";

export default function AddComponenteRecipeModal({ isVisible, setVisible }) {
  const [componenteRecipeName, setComponentRecipeName] = useState("");

  const [men, setMen] = useState("");
  const [hours, setHours] = useState("");

  const [materials, setMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
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
        Number(hours)
      );

      const component_recipe_id = recipe_component[0].component_recipe_id;

      for (const m of materialsQuantity) {
        await createCompRecipeMat(
          component_recipe_id,
          m.id,
          Number(m.quantity)
        );
      }

      clearStates();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar lista de materiais", err);
    }
  };

  // --- ALTERAÇÃO: Lógica para calcular o valor total ---
  const totalValue = materialsList.reduce((acc, id) => {
    const material = materials.find((m) => m.material_id === id);
    const itemQty = materialsQuantity.find((q) => q.id === id);

    const price = material ? Number(material.value) : 0;
    const quantity = itemQty ? Number(itemQty.quantity) : 0;

    return acc + price * quantity;
  }, 0);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-screen min-h-screen overflow-auto">
      <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-[70vw] max-w-[120vw] h-[70vh] max-h-[90vh] flex flex-col space-y-8 overflow-auto">
        <form
          className="flex flex-col  space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Título + botão X */}
          <div className="flex flex-row items-center justify-between space-x-2">
            <p className="text-lg font-semibold">
              Adicionar Receita do Componente
            </p>

            <button onClick={() => setVisible(false)} type="button">
              <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
            </button>
          </div>

          <div className="flex flex-row w-full justify-between gap-6">
            {/* Nome do componente */}
            <div className="flex flex-col space-y-2 w-1/2">
              <label className="text-gray-700">Nome *</label>
              <input
                type="text"
                className="p-2 rounded"
                placeholder="Digite o nome do Componente"
                value={componenteRecipeName}
                onChange={(e) => setComponentRecipeName(e.target.value)}
                required
              />
            </div>

            {/* Inputs para Homens e Horas */}
            <div className="flex flex-row w-1/2 gap-4">
              <div className="flex flex-col space-y-2 w-1/2">
                <label className="text-gray-700">Qtd. Homens *</label>
                <input
                  type="number"
                  className="p-2 rounded"
                  placeholder="Ex: 2"
                  value={men}
                  onChange={(e) => setMen(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="flex flex-col space-y-2 w-1/2">
                <label className="text-gray-700">Qtd. Horas *</label>
                <input
                  type="number"
                  className="p-2 rounded"
                  placeholder="Ex: 1.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-700">Materiais *</label>
            <SelectMenu
              options={materials.map((m) => ({
                id: m.material_id,
                label: m.material_name,
              }))}
              selectedOption={materialsList}
              setSelectedOption={setMaterialsList}
            />
          </div>

          {/* Lista de Materiais */}
          <div className="flex flex-col justify-center intems-center bg-white p-2 rounded w-full">
            <table className="space-y-2 w-full">
              <thead>
                <tr className="grid grid-cols-6 gap-6">
                  <th className="font-normal ">Material</th>
                  <th className="font-normal ">Descrição</th>
                  <th className="font-normal ">Valor Unitário</th>
                  <th className="font-normal ">Quantidade</th>
                  <th className="font-normal ">Valor Total</th>
                  <th className="font-normal">Ação</th>
                </tr>
              </thead>

              <tbody className="font-serif text-center">
                {materialsList.map((id) => (
                  <tr key={id} className="grid grid-cols-6 gap-6">
                    {/* Material */}
                    <td>
                      {Array.isArray(materialsList) && materialsList.length > 0
                        ? (() => {
                            const found = materials.find(
                              (m) => m.material_id === id
                            );
                            return found ? found.material_name ?? "-" : "-";
                          })()
                        : "-"}
                    </td>

                    {/* Descrição */}
                    <td>
                      {Array.isArray(materialsList) && materialsList.length > 0
                        ? (() => {
                            const found = materials.find(
                              (m) => m.material_id === id
                            );
                            return found ? found.material_desc ?? "-" : "-";
                          })()
                        : "-"}
                    </td>

                    {/* Valor unitário */}
                    <td>
                      {Array.isArray(materialsList) && materialsList.length > 0
                        ? (() => {
                            const found = materials.find(
                              (m) => m.material_id === id
                            );
                            return found
                              ? Number(found.value).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : "R$ 0.00";
                          })()
                        : "0.00"}
                    </td>

                    {/* Quantidade */}
                    <td>
                      <input
                        type="number"
                        className="border p-1 w-20"
                        value={
                          materialsQuantity.find((m) => m.id === id)
                            ?.quantity || ""
                        }
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          setMaterialsQuantity((prev) =>
                            prev.map((m) =>
                              m.id === id ? { ...m, quantity: newValue } : m
                            )
                          );
                        }}
                      />
                    </td>

                    {/* Valor total */}
                    <td>
                      {(() => {
                        const qtd =
                          materialsQuantity.find((q) => q.id === id)
                            ?.quantity || 0;
                        const unit = (() => {
                          if (
                            Array.isArray(materialsList) &&
                            materialsList.length > 0
                          ) {
                            const found = materials.find(
                              (m) => m.material_id === id
                            );
                            return found ? Number(found.value) : 0;
                          }
                          return 0;
                        })();
                        return (qtd * unit).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        });
                      })()}
                    </td>
                    <td>
                      <button
                        className="bnt font-normal font-sans"
                        type="button"
                        onClick={() => {
                          setMaterialsList(materialsList.filter((i) => i != id));
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botões */}
          <div className="flex flex-row justify-end items-center space-x-4">
            
            <div className="bg-white p-2 rounded">
              Total:{" "}
              {totalValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>

            <button
              className="p-2 bg-slate-50 hover:bg-gray-300 rounded"
              onClick={() => clearStates()}
              type="button"
            >
              Cancelar
            </button>
            <button className="bnt-add" type="submit">
              Salvar Receita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}