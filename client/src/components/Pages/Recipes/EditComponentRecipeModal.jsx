import { IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";

// REMOVI O IMPORT EXTERNO PARA EVITAR ERRO DE CAMINHO
// import { parseBRL } from "../../../utils/IntUtils"; 

import SelectMenu from "../../Ui/SelectMenu";

import { listMaterials } from "@services/MaterialService.js";
import { updateComponentRecipe } from "@services/ComponentRecipes.js";
import {
  createCompRecipeMat,
  readCompRecipeMatByComp,
  updateCompRecipeMat,
  deleteCompRecipeMat,
} from "@services/ComponentRecipeMaterials.js";

// Função local segura para formatar moeda
const parseBRL = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  const [materialsQuantity, setMaterialsQuantity] = useState([]);
  const [materialsQuantityBackUp, setMaterialsQuantityBackUp] = useState([]);

  // 1. Carregar Materiais
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

  // 2. Carregar Dados do Componente
  useEffect(() => {
    const loadInit = async () => {
      // Se componente for nulo ou undefined, para aqui
      if (!component) return;

      setComponentRecipeName(component.Componente ?? "");
      
      // LEITURA SEGURA DOS DADOS (Evita NaN)
      // Tenta ler as chaves novas, se falhar, tenta as antigas
      const rawFunc = component["Total Funcionários"];
      const rawHoras = component["Total Horas"];
      const rawManHours = component["Horas-Homens"] || component["Horas Homem"];

      let valFunc = 1;
      let valHoras = 0;

      if (rawFunc !== undefined && rawHoras !== undefined) {
        // Se tem as colunas separadas
        valFunc = Number(rawFunc);
        valHoras = Number(rawHoras);
      } else {
        // Se só tem o total (Legado)
        valFunc = 1;
        valHoras = Number(rawManHours);
      }

      // Proteção final contra NaN (se o banco vier vazio ou texto inválido)
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

  // 3. Sincronização
  useEffect(() => {
    setMaterialsQuantity((prev) => {
      const exist = new Set(prev.map((p) => p.id));
      const newItems = materialsList
        .filter((id) => !exist.has(id))
        .map((id) => ({ id, quantity: 1 }));
      return [...prev, ...newItems];
    });
  }, [materialsList]);

  // Ações
  const clearStates = () => {
    setComponentRecipeName("");
    setTotalEmployees(1);
    setTotalHours(0);
    setMaterialsList([]);
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

      if (!componenteRecipeName || totalEmployees <= 0 || materialsList.length <= 0) {
        alert("Preencha todos os dados obrigatórios corretamente.");
        return;
      }

      // Garante números válidos no cálculo
      const safeEmployees = Number(totalEmployees) || 1;
      const safeHours = Number(totalHours) || 0;

      await updateComponentRecipe(component.ID, componenteRecipeName, safeEmployees, safeHours);

      const quantities = materialsList.map((id) => {
        const item = materialsQuantity.find((q) => q.id === id);
        return {
          id: id,
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
      // window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar. Verifique o console.");
    }
  };

  // Se não estiver visível, não renderiza nada
  if (!isVisible) return null;
  // Se estiver visível mas o componente for inválido, evita crash
  if (!component && isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-screen min-h-screen overflow-auto">
      <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-[70vw] max-w-[120vw] h-[70vh] max-h-[90vh] flex flex-col space-y-8 overflow-auto">
        <form
          className="flex flex-col space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="flex flex-row items-center justify-between space-x-2">
            <p className="text-lg font-semibold">Editar Receita do Componente</p>
            <button onClick={() => clearStates()} type="button">
              <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6 w-full">
            <div className="col-span-6 flex flex-col space-y-2">
              <label className="text-gray-700">Nome *</label>
              <input
                type="text"
                className="p-1 rounded"
                placeholder="Nome do componente"
                value={componenteRecipeName}
                onChange={(e) => setComponentRecipeName(e.target.value)}
                required
              />
            </div>

            <div className="col-span-3 flex flex-col space-y-2">
              <label className="text-gray-700">Total Funcionários *</label>
              <input
                type="number"
                min="1"
                className="p-1 rounded text-center"
                value={totalEmployees}
                // Previne input vazio ou inválido visualmente
                onChange={(e) => setTotalEmployees(e.target.value)}
                required
              />
            </div>

            <div className="col-span-3 flex flex-col space-y-2">
              <label className="text-gray-700">Total de Horas *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="p-1 rounded text-center"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 w-full">
            <label className="text-gray-700">Materiais *</label>
            <SelectMenu
              // Proteção caso materials seja null/undefined
              options={(materials || []).map((m) => ({
                id: m.material_id,
                label: m.material_name,
              }))}
              selectedOption={materialsList}
              setSelectedOption={setMaterialsList}
            />
          </div>

          <div className="flex flex-col justify-center bg-white p-2 rounded w-full">
            <table className="space-y-2 w-full">
              <thead>
                <tr className="grid grid-cols-6 gap-6">
                  <th className="font-normal">Material</th>
                  <th className="font-normal">Descrição</th>
                  <th className="font-normal">Valor Unitário</th>
                  <th className="font-normal">Quantidade</th>
                  <th className="font-normal">Valor Total</th>
                  <th className="font-normal">Ação</th>
                </tr>
              </thead>
              <tbody className="font-serif text-center">
                {materialsList.map((id) => {
                  if (!materials || !materials.length) return null;

                  const mat = materials.find((m) => m.material_id === id);
                  const objQty = materialsQuantity.find((m) => m.id === id);
                  const currentQtd = objQty ? objQty.quantity : 0;
                  
                  // Proteção para o cálculo de valor
                  const unitValue = Number(mat?.value) || 0;

                  return (
                    <tr key={id} className="grid grid-cols-6 gap-6">
                      <td>{mat?.material_name ?? "-"}</td>
                      <td>{mat?.material_desc ?? "-"}</td>
                      {/* Usando o parseBRL local */}
                      <td>{parseBRL(unitValue)}</td>
                      <td>
                        <input
                          type="number"
                          className="border p-1 w-20 text-center"
                          value={currentQtd}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newValue = val === "" ? 0 : Number(val);
                            setMaterialsQuantity((prev) =>
                              prev.map((m) =>
                                m.id === id ? { ...m, quantity: newValue } : m
                              )
                            );
                          }}
                        />
                      </td>
                      <td>
                        {parseBRL(currentQtd * unitValue)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            setMaterialsList((list) => list.filter((x) => x !== id));
                            setMaterialsQuantity((prev) => prev.filter((x) => x.id !== id));
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

          <div className="flex flex-row justify-end items-center space-x-4">
            <button
              className="p-2 bg-slate-50 hover:bg-gray-300 rounded"
              type="button"
              onClick={() => clearStates()}
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