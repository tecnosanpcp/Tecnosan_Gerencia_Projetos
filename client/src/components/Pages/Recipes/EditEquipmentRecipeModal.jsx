import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
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

  // Listas de controle
  const [componentsRecipeList, setComponentRecipeList] = useState([]);
  const [componentsRecipeQuantity, setComponentsRecipeQuantity] = useState([]);
  const [quantityBackUp, setQuantityBackUp] = useState([]);

  // 1. Carregar Materiais (SelectMenu)
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

      const nome = equipment?.Equipamento || equipment?.["Nome do Equipamento"] || "";
      setEquipmentRecipeName(nome);

      if (!equipment?.ID) return;

      try {
        const data = await readEquipRecipeCompRecipeById(equipment?.ID);
        
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

  const handleEdit = async () => {
    try {
      // Verificação extra na hora de salvar
      if (!equipment || !equipment.ID) {
        alert("Erro: Equipamento não identificado.");
        return;
      }

      if (!equipmentRecipeName || componentsRecipeList.length <= 0) {
        alert("Preencha todos os dados obrigatórios.");
        return;
      }

      await updateEquipmentRecipe(equipment?.ID, equipmentRecipeName);

      // Prepara lista para salvar
      const quantities = componentsRecipeList.map((id) => {
        const item = componentsRecipeQuantity.find((q) => q.id === id);
        return {
          id: id,
          quantity: item ? Number(item.quantity) : 1,
        };
      });

      // Salva/Atualiza Itens
      for (const item of quantities) {
        const old = quantityBackUp.find((b) => b.id === item.id);
        if (!old) {
          await createEquipRecipeCompRecipe(equipment?.ID, item.id, item.quantity);
        } else if (old.quantity !== item.quantity) {
          await updateEquipRecipeCompRecipe(equipment?.ID, item.id, item.quantity);
        }
      }

      // Deleta Itens removidos
      for (const oldItem of quantityBackUp) {
        const stillExists = quantities.some((e) => e.id === oldItem.id);
        if (!stillExists) {
          await deleteEquipRecipeCompRecipe(equipment?.ID, oldItem.id);
        }
      }

      clearStates();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // --- ALTERAÇÃO: Cálculo do Valor Total ---
  const totalValue = componentsRecipeList.reduce((acc, id) => {
    const item = componentsRecipes.find((c) => c.component_recipe_id === id);
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
          className="flex flex-col space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          <div className="flex flex-row items-center justify-between space-x-2">
            <p className="text-lg font-semibold">Editar Receita do Equipamento</p>
            <button onClick={() => setVisible(false)} type="button">
              <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
            </button>
          </div>

          <div className="flex flex-row w-full justify-between gap-6">
            <div className="flex flex-col space-y-2 w-full">
              <label className="text-gray-700">Nome *</label>
              <input
                type="text"
                className="p-1 rounded"
                placeholder="Nome do equipamento"
                value={equipmentRecipeName}
                onChange={(e) => setEquipmentRecipeName(e.target.value)}
                required
              />
            </div>
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

          <div className="flex flex-col justify-center bg-white p-2 rounded w-full">
            <table className="space-y-2 w-full">
              <thead>
                <tr className="grid grid-cols-6 gap-6">
                  <th className="font-normal">Componentes</th>
                  <th className="font-normal">Horas-Homem</th>
                  <th className="font-normal">Valor Unitário</th>
                  <th className="font-normal">Quantidade</th>
                  <th className="font-normal">Valor Total</th>
                  <th className="font-normal">Ação</th>
                </tr>
              </thead>
              <tbody className="font-serif text-center">
                {componentsRecipeList.map((id) => {
                   if (!componentsRecipes.length) return null; 

                   const found = componentsRecipes.find(m => m.component_recipe_id === id);
                   const qtd_obj = componentsRecipeQuantity.find(c => c.id === id);
                   const currentQtd = qtd_obj ? qtd_obj.quantity : "";

                   return (
                    <tr key={id} className="grid grid-cols-6 gap-6">
                      <td>{found?.recipe_name ?? "-"}</td>
                      <td>{found?.horas_homem ?? "-"}</td>
                      <td>{parseBRL(found?.total_value)}</td>
                      <td>
                        <input
                          type="number"
                          className="border p-1 w-20 text-center"
                          value={currentQtd}
                          onChange={(e) => {
                            setComponentsRecipeQuantity(prev =>
                              prev.map(m => m.id === id ? { ...m, quantity: Number(e.target.value) } : m)
                            );
                          }}
                        />
                      </td>
                      <td>{parseBRL((currentQtd || 0) * (found?.total_value || 0))}</td>
                      <td>
                        <button
                          className="text-red-600 hover:text-red-800"
                          type="button"
                          onClick={() => setComponentRecipeList(prev => prev.filter(i => i !== id))}
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