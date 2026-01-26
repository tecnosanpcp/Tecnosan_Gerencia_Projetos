import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
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
  const [componentsRecipeQuantity, setComponentsRecipeQuantity] = useState([]);

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
        .map((id) => ({ id, quantity: 1 }));

      return [...prev, ...newItems];
    });
  }, [componentsRecipeList]);

  const clearStates = () => {
    setEquipmentRecipeName("");
    setComponentRecipeList([]);
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
          er_cr.quantity
        );
      }
      clearStates();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar lista de componentes", err);
    }
  };

  // --- ALTERAÇÃO: Cálculo do Valor Total ---
  const totalValue = componentsRecipeList.reduce((acc, id) => {
    const item = componentsRecipes.find((m) => m.component_recipe_id === id);
    const qtyObj = componentsRecipeQuantity.find((q) => q.id === id);

    const price = item ? Number(item.total_value) : 0;
    const quantity = qtyObj ? Number(qtyObj.quantity) : 0;

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
              Adicionar Receita do Equipamento
            </p>

            <button onClick={() => setVisible(false)} type="button">
              <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
            </button>
          </div>

          <div className="flex flex-row w-full justify-between gap-6">
            {/* Nome do componente */}
            <div className="flex flex-col space-y-2 w-full">
              <label className="text-gray-700">Nome *</label>
              <input
                type="text"
                className="p-1 rounded"
                placeholder="Digite o nome do material"
                value={equipmentRecipeName}
                onChange={(e) => setEquipmentRecipeName(e.target.value)}
                required
              />
            </div>
            {/* Componentes */}
            <div className="flex flex-col space-y-2 w-full">
              <label className="text-gray-700">Componentes *</label>
              <SelectMenu
                options={componentsRecipes.map((m) => ({
                  id: m.component_recipe_id,
                  label: m.recipe_name,
                }))}
                selectedOption={componentsRecipeList}
                setSelectedOption={setComponentRecipeList}
              />
            </div>
          </div>

          {/* Lista de Materiais a serem usadas no componente */}
          <div className="flex flex-col justify-center intems-center bg-white p-2 rounded w-full">
            <table className="space-y-2 w-full">
              <thead>
                <tr className="grid grid-cols-6 gap-6">
                  <th className="font-normal ">Componentes</th>
                  <th className="font-normal ">Horas-Homem</th>
                  <th className="font-normal ">Valor Unitário</th>
                  <th className="font-normal ">Quantidade</th>
                  <th className="font-normal ">Valor Total</th>
                  <th className="font-normal">Ação</th>
                </tr>
              </thead>

              <tbody className="font-serif text-center">
                {componentsRecipeList.map((id) => {
                  if (
                    !Array.isArray(componentsRecipeList) ||
                    componentsRecipeList.length <= 0
                  )
                    return null;

                  const found = componentsRecipes.find(
                    (m) => m.component_recipe_id === id
                  );

                  const qtd_find = componentsRecipeQuantity.find(
                    (c) => c.id == id
                  );

                  return (
                    <tr key={id} className="grid grid-cols-6 gap-6">
                      {/* Material */}
                      <td>{found?.recipe_name ?? "-"}</td>

                      {/* Horas Homem */}
                      <td>{found?.horas_homem ?? "-"}</td>

                      {/* Valor unitário */}
                      <td>{parseBRL(found?.total_value) ?? parseBRL(0)}</td>

                      {/* Quantidade */}
                      <td>
                        <input
                          type="number"
                          className="border p-1 w-20"
                          value={
                            componentsRecipeQuantity.find((m) => m.id === id)
                              ?.quantity || ""
                          }
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setComponentsRecipeQuantity((prev) =>
                              prev.map((m) =>
                                m.id === id
                                  ? { ...m, quantity: parseInt(newValue) || 0 }
                                  : m
                              )
                            );
                          }}
                        />
                      </td>

                      {/* Valor total */}
                      <td>
                        {parseBRL(qtd_find?.quantity * found?.total_value) ??
                          parseBRL(0)}
                      </td>

                      <td>
                        <button
                          className="bnt font-normal font-sans"
                          type="button"
                          onClick={() => {
                            setComponentRecipeList(
                              componentsRecipeList.filter((i) => i != id)
                            );
                          }}
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

          {/* Botões */}
          <div className="flex flex-row justify-end items-center space-x-4">
            
            <div className="bg-white p-2 rounded">
              Total: {parseBRL(totalValue)}
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