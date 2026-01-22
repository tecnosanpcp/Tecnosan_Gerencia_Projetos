import React, { useEffect, useState } from "react";

// Serviço para buscar materiais e catálogo de nomes
import { 
  vwMaterialDetailsComponentsRecipes, 
  vwComponentRecipeMaterials 
} from "@services/ViewsService.js";

// Serviço para buscar os vínculos do equipamento
import { readEquipRecipeCompRecipeById } from "@services/EquipRecipeCompRecipe.js";

const formatMoney = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export default function RenderSubTable({ row, expandedRow, i }) {
  const [mainData, setMainData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para a tabela aninhada
  const [nestedExpandedId, setNestedExpandedId] = useState(null);
  const [nestedMaterials, setNestedMaterials] = useState([]);
  const [nestedLoading, setNestedLoading] = useState(false);

  // 1. CARREGAMENTO DOS DADOS PRINCIPAIS
  useEffect(() => {
    if (!expandedRow || expandedRow.ID !== row.ID) return;

    const loadData = async () => {
      setLoading(true);
      setMainData([]);
      setNestedExpandedId(null); 
      setNestedMaterials([]);

      try {
        if (i.label === "Componente") {
          const data = await vwMaterialDetailsComponentsRecipes(row.ID);
          setMainData(data || []);
        } 
        else if (i.label === "Equipamento") {
          const [relations, catalog] = await Promise.all([
            readEquipRecipeCompRecipeById(row.ID),
            vwComponentRecipeMaterials()
          ]);

          if (Array.isArray(relations)) {
            const nameMap = {};
            if (Array.isArray(catalog)) {
              catalog.forEach((c) => {
                nameMap[c.component_recipe_id] = c.recipe_name;
              });
            }

            const enrichedData = relations.map((item) => ({
              ...item,
              resolved_name: nameMap[item.component_recipe_id] || `ID: ${item.component_recipe_id}`,
            }));

            setMainData(enrichedData);
          } else {
            setMainData([]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [row.ID, expandedRow, i.label]);

  // 2. FUNÇÃO PARA ABRIR MATERIAIS DO COMPONENTE
  const handleToggleNested = async (componentRecipeId) => {
    if (nestedExpandedId === componentRecipeId) {
      setNestedExpandedId(null);
      setNestedMaterials([]);
      return;
    }

    setNestedExpandedId(componentRecipeId);
    setNestedLoading(true);

    try {
      const data = await vwMaterialDetailsComponentsRecipes(componentRecipeId);
      setNestedMaterials(data || []);
    } catch (error) {
      console.error("Erro ao carregar materiais aninhados:", error);
      setNestedMaterials([]);
    } finally {
      setNestedLoading(false);
    }
  };

  if (!expandedRow || expandedRow.ID !== row.ID) return null;

  // ==================================================================================
  // VISUALIZAÇÃO: EQUIPAMENTO
  // ==================================================================================
  if (i.label === "Equipamento") {
    return (
      <tr className="bg-gray-50">
        <td colSpan="100%" className="p-4">
          <div className="bg-white rounded border border-gray-300 overflow-hidden shadow-sm">
            {/* Cabeçalho do Card */}
            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
              <h4 className="font-bold text-sm text-black">
                Componentes do Equipamento: <span className="font-normal">{row.Equipamento}</span>
              </h4>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="p-4 text-center text-xs text-black">Carregando dados...</div>
              ) : mainData.length === 0 ? (
                <div className="p-4 text-center text-xs text-black">
                  Nenhum registro encontrado.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    {/* Cabeçalho da Tabela - Fonte Preta */}
                    <tr className="bg-gray-100 border-b border-gray-300 text-black text-xs uppercase tracking-wide font-bold">
                      <th className="px-4 py-2 border-r border-gray-200">Componente</th>
                      <th className="px-4 py-2 text-center border-r border-gray-200">Qtd Planejada</th>
                      <th className="px-4 py-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {mainData.map((item, idx) => (
                      <React.Fragment key={idx}>
                        {/* LINHA DO COMPONENTE - Fonte Preta */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2 border-r border-gray-200 text-black font-medium">
                            {item.resolved_name}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200 text-black">
                            {Number(item.quantity_plan).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleToggleNested(item.component_recipe_id)}
                              className="px-2 py-1 rounded text-xs border border-gray-300 bg-white text-black hover:bg-gray-200 transition-colors"
                            >
                              {nestedExpandedId === item.component_recipe_id ? "Ocultar" : "Ver Materiais"}
                            </button>
                          </td>
                        </tr>

                        {/* SUB-TABELA ANINHADA (MATERIAIS DO COMPONENTE) */}
                        {nestedExpandedId === item.component_recipe_id && (
                          <tr className="bg-gray-100">
                            <td colSpan="100%" className="p-3 border-b border-gray-300 shadow-inner">
                              <div className="bg-white border border-gray-300 rounded mx-4 overflow-hidden">
                                <div className="bg-gray-200 px-3 py-1 border-b border-gray-300">
                                  <span className="text-[10px] font-bold text-black uppercase tracking-wide">
                                    Materiais de: {item.resolved_name}
                                  </span>
                                </div>
                                
                                {nestedLoading ? (
                                  <div className="p-2 text-center text-xs text-black">Carregando...</div>
                                ) : nestedMaterials.length === 0 ? (
                                  <div className="p-2 text-center text-xs text-black">Nenhum material encontrado.</div>
                                ) : (
                                  <table className="w-full text-xs text-left">
                                    <thead>
                                      <tr className="border-b border-gray-200 text-black font-bold bg-gray-50">
                                        <th className="px-3 py-2">Material</th>
                                        <th className="px-3 py-2">Descrição</th>
                                        <th className="px-3 py-2 text-center">Qtd</th>
                                        <th className="px-3 py-2 text-right">Unitário</th>
                                        <th className="px-3 py-2 text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-black">
                                      {nestedMaterials.map((mat, mIdx) => (
                                        <tr key={mIdx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                          <td className="px-3 py-1 font-medium">
                                            {mat.material_name || mat.Material}
                                          </td>
                                          <td className="px-3 py-1 italic text-gray-800">
                                            {mat.material_desc || "-"}
                                          </td>
                                          <td className="px-3 py-1 text-center">
                                            {Number(mat.quantity_plan).toFixed(2)}
                                          </td>
                                          <td className="px-3 py-1 text-right">
                                            {formatMoney(mat.value)}
                                          </td>
                                          <td className="px-3 py-1 text-right font-bold">
                                            {formatMoney((mat.value || 0) * (mat.quantity_plan || 0))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  // ==================================================================================
  // VISUALIZAÇÃO: COMPONENTE (Padrão)
  // ==================================================================================
  if (i.label === "Componente") {
    return (
      <tr className="bg-gray-50">
        <td colSpan="100%" className="p-4">
          <div className="bg-white rounded border border-gray-300 overflow-hidden shadow-sm">
            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
              <h4 className="font-bold text-sm text-black">
                Lista de Materiais: {row.Componente}
              </h4>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="p-4 text-center text-xs text-black">Carregando...</div>
              ) : mainData.length === 0 ? (
                <div className="p-4 text-center text-xs text-black">Nenhum material.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-black text-xs uppercase tracking-wide font-bold">
                      <th className="px-4 py-2 border-r border-gray-200">Material</th>
                      <th className="px-4 py-2 border-r border-gray-200">Descrição</th>
                      <th className="px-4 py-2 text-center border-r border-gray-200">Qtd</th>
                      <th className="px-4 py-2 text-right border-r border-gray-200">Unitário</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {mainData.map((mat, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 border-r border-gray-200 text-black font-medium">
                          {mat.material_name || mat.Material || "-"}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200 text-gray-900 text-xs italic">
                          {mat.material_desc || "-"}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200 text-black">
                          {Number(mat.quantity_plan).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right border-r border-gray-200 text-black">
                          {formatMoney(mat.value)}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-black">
                          {formatMoney((mat.value || 0) * (mat.quantity_plan || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return null;
}""