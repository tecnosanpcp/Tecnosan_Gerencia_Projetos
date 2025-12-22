import React, { useEffect, useState } from "react";
import {
  vwMaterialDetailsComponentsRecipes,
  vwMaterialDetailsEquipmentRecipes,
} from "@services/ViewsService.js";

export default function RenderSubTable({ row, expandedRow, i }) {
  const [materials, setMaterials] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  useEffect(() => {
    if (!row?.ID) return;

    // Busca Materiais
    const fetchMaterials = async () => {
      try {
        const data = await vwMaterialDetailsComponentsRecipes(row.ID);
        setMaterials(data || []);
      } catch (error) {
        console.error("Erro materiais:", error);
      }
    };

    // Busca Componentes (COM FILTRO DE DUPLICATAS)
    const fetchComponents = async () => {
      try {
        const data = await vwMaterialDetailsEquipmentRecipes(row.ID);
        
        if (data && Array.isArray(data)) {
          // Remove itens com o mesmo 'component_recipe_id'
          const uniqueData = data.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              t.component_recipe_id === obj.component_recipe_id
            ))
          );
          setComponents(uniqueData);
        } else {
          setComponents([]);
        }

      } catch (error) {
        console.error("Erro componentes:", error);
      }
    };

    fetchMaterials();
    fetchComponents();
  }, [row?.ID, expandedRow]);

  if (!expandedRow || expandedRow.ID !== row.ID) return null;

  // ... (Restante do código de renderização igual ao anterior) ...
  
  // Renderização da tabela de Equipamento
  if (i.label === "Equipamento") {
    return (
      <tr>
        <td colSpan="100%">
          <div className="bg-gray-50 p-4 rounded border mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1">Componente</th>
                  <th className="px-2 py-1">Quantidade</th>
                  <th className="px-2 py-1">Valor Unitário</th>
                  <th className="px-2 py-1">Valor Total</th>
                  <th className="px-2 py-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {components?.map((c) => (
                  <React.Fragment key={c.component_recipe_id}>
                    <tr className="border-b">
                      <td className="px-2 py-1">{c.component_recipe_name}</td>
                      <td className="px-2 py-1">{c.quantity_component_plan}</td>
                      <td className="px-2 py-1">{c.value}</td>
                      <td className="px-2 py-1">
                        {c.value * c.quantity_component_plan}
                      </td>
                      <td className="px-2 py-1">
                        <button
                          className="bg-gray-200 px-2 py-1 rounded"
                          onClick={async () => {
                            if (selectedComponent === c.component_recipe_id) {
                              setSelectedComponent(null);
                              setSelectedMaterials([]);
                              return;
                            }
                            setSelectedComponent(c.component_recipe_id);
                            const data = await vwMaterialDetailsComponentsRecipes(c.component_recipe_id);
                            setSelectedMaterials(data);
                          }}
                        >
                          Visualizar
                        </button>
                      </td>
                    </tr>
                    
                    {/* Sub-tabela interna */}
                    {selectedComponent === c.component_recipe_id && (
                      <tr className="bg-white">
                        <td colSpan="100%">
                           <div className="p-3 border rounded bg-white mt-2">
                             <p className="font-semibold mb-2">Materiais de: {c.component_recipe_name}</p>
                             <table className="w-full text-left border-collapse">
                               <thead>
                                 <tr className="border-b">
                                   <th className="px-2 py-1">Material</th>
                                   <th className="px-2 py-1">Qtd</th>
                                   <th className="px-2 py-1">Vl. Unit</th>
                                   <th className="px-2 py-1">Total</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {selectedMaterials?.map((m, idx) => (
                                   <tr key={idx} className="border-b">
                                     <td className="px-2 py-1">{m.material_name}</td>
                                     <td className="px-2 py-1">{m.quantity_plan}</td>
                                     <td className="px-2 py-1">{m.value}</td>
                                     <td className="px-2 py-1">{m.value * m.quantity_plan}</td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    );
  }

  // Bloco de Componente (sem alterações lógicas, apenas visuais se necessário)
  if (i.label === "Componente") {
     // ... (seu código existente)
     return (
        // ... (seu código existente)
         <tbody>
            {materials?.map((m, idx) => (
              <tr key={idx} className="border-b">
                 {/* ... */}
              </tr>
            ))}
         </tbody>
        // ...
     )
  }

  return null;
}