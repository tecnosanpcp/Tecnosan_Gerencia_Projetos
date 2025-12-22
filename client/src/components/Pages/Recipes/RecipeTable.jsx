import React, { useState } from "react";
import AlertModal from "../../Ui/AlertModal.jsx";
import EditMaterialModal from "./EditMaterialModal.jsx";
import EditComponentRecipeModal from "./EditComponentRecipeModal.jsx";
import EditEquipmentRecipeModal from "./EditEquipmentRecipeModal.jsx";
import RenderSubTable from "./RenderSubTable.jsx";

import { deleteMaterial } from "@services/MaterialService.js";
import { deleteComponentRecipe } from "@services/ComponentRecipes.js";

export default function RecipeTable({ i }) {
  const [modalDeleteVisible, setModalDeleteVisible] = useState({
    Material: false,
    Componente: false,
    Equipamento: false,
  });

  const [editType, setEditType] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const updateModalDeleteVisible = (key, value) => {
    setModalDeleteVisible((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const modalLabel = {
    Material: {
      title: "Quer excluir esse material?",
      body: "Tem certeza que quer excluir esse material? A ação não é reversivel",
      deleteFunc: async (id) => {
        await deleteMaterial(id);
        window.location.reload();
      },
    },

    Componente: {
      title: "Quer excluir esse componente?",
      body: "Tem certeza que quer excluir esse componente? A ação não é reversivel",
      deleteFunc: async (id) => {
        await deleteComponentRecipe(id);
        window.location.reload();
      },
    },

    Equipamento: {
      title: "Quer excluir esse equipamento?",
      body: "Tem certeza que quer excluir esse equipamento? A ação não é reversivel",
      deleteFunc: () => console.log("DELETANDO EQUIPAMENTO"),
    },
  };

  const openEditModal = (label, row) => {
    setSelectedRow(row);
    setEditType(label);
  };

  const renderEditModal = () => {
    switch (editType) {
      case "Material":
        return (
          <EditMaterialModal
            isVisible={true}
            setVisible={() => setEditType(null)}
            material={selectedRow}
          />
        );
      case "Componente":
        return (
          <EditComponentRecipeModal
            isVisible={true}
            setVisible={() => setEditType(null)}
            component={selectedRow}
          />
        );
      case "Equipamento":
        return (
          <EditEquipmentRecipeModal
            isVisible={true}
            setVisible={() => setEditType(null)}
            equipment={selectedRow}
          />
        );
      default:
        return null;
    }
  };

  return (
    i.isExpand === true && (
      <>
        <AlertModal
          title={modalLabel[i.label].title}
          body={modalLabel[i.label].body}
          neg_opt="Cancelar"
          pos_opt="Excluir"
          func={() => modalLabel[i.label].deleteFunc(selectedRow.ID)}
          isVisible={modalDeleteVisible[i.label]}
          setVisible={() => updateModalDeleteVisible(i.label, false)}
          style="waring"
        />

        {renderEditModal()}

        <div className="card mt-4">
          {i.list.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum item cadastrado.</p>
          ) : (
            <table className="text-left border-collapse w-full">
              <thead>
                <tr className="border-b">
                  {Object.keys(i.list[0]).map(
                    (col, index) =>
                      index > 0 && (
                        <th key={index} className="py-2 px-3 text-center">
                          {col}
                        </th>
                      )
                  )}
                  <th className="border-b text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {i.list.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-b hover:bg-gray-100">
                      {Object.values(row).map(
                        (val, colIndex) =>
                          colIndex > 0 && (
                            <td key={colIndex} className="py-2 px-3">
                              {val}
                            </td>
                          )
                      )}

                      <td className="space-x-4 py-2 px-3">
                        {i.label !== "Material" && (
                          <button
                            className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                            onClick={() =>
                              setExpandedRow(
                                expandedRow?.ID === row.ID ? null : row
                              )
                            }
                          >
                            Visualizar
                          </button>
                        )}

                        <button
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                          onClick={() => openEditModal(i.label, row)}
                        >
                          Editar
                        </button>

                        <button
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                          onClick={() => {
                            setSelectedRow(row);
                            updateModalDeleteVisible(i.label, true);
                          }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>

                    <RenderSubTable
                      row={row}
                      expandedRow={expandedRow}
                      i={i}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    )
  );
}
