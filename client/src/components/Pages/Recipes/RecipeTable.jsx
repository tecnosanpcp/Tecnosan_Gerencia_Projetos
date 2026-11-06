import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import { deleteItemsBatch } from "@services/BatchDeleteService.js";

import AlertModal from "../../Ui/AlertModal.jsx";
import EditMaterialModal from "./EditMaterialModal.jsx";
import EditComponentRecipeModal from "./EditComponentRecipeModal.jsx";
import EditEquipmentRecipeModal from "./EditEquipmentRecipeModal.jsx";
import EditAccessoryTypeModal from "./EditAccessoryTypeModal.jsx";
import RenderSubTable from "./RenderSubTable.jsx";

import { deleteMaterial } from "@services/MaterialService.js";
import { deleteComponentRecipe } from "@services/ComponentRecipes.js";
import { deleteEquipmentRecipe } from "@services/EquipmentRecipesService.js";
import { deleteAccessory } from "@services/AccessoriesServices.js";
import { useQueryClient } from "@tanstack/react-query";

export default function RecipeTable({ i }) {
  const [modalDeleteVisible, setModalDeleteVisible] = useState({
    Material: false,
    Acessório: false,
    Componente: false,
    Equipamento: false,
  });

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [editType, setEditType] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 50;

  const queryClient = useQueryClient();

  /*
   * A lista REAL continua vindo do componente pai através de i.list.
   * Não fazemos nenhuma chamada de API aqui.
   */
  const list = Array.isArray(i?.list) ? i.list : [];

  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));

  const page = Math.min(currentPage, totalPages);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, list.length);

  const paginatedList = list.slice(startIndex, endIndex);

  const updateModalDeleteVisible = (key, value) => {
    setModalDeleteVisible((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const modalLabel = {
    Material: {
      title: "Quer excluir esse material?",
      body: "Tem certeza que quer excluir esse material? A ação não é reversível.",
      deleteFunc: async (id) => {
        await deleteMaterial(id);
        queryClient.invalidateQueries(["materials"]);
      },
    },

    Acessório: {
      title: "Quer excluir esse acessório?",
      body: "Tem certeza? Isso apagará o item do estoque físico.",
      deleteFunc: async (id) => {
        await deleteAccessory(id);
        queryClient.invalidateQueries(["accessories"]);
      },
    },

    Componente: {
      title: "Quer excluir esse componente?",
      body: "Tem certeza que quer excluir esse componente? A ação não é reversível.",
      deleteFunc: async (id) => {
        await deleteComponentRecipe(id);
        queryClient.invalidateQueries(["components"]);
      },
    },

    Equipamento: {
      title: "Quer excluir esse equipamento?",
      body: "Tem certeza que quer excluir esse equipamento? A ação não é reversível.",
      deleteFunc: async (id) => {
        await deleteEquipmentRecipe(id);
        queryClient.invalidateQueries(["equipments"]);
      },
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

      case "Acessório":
        return (
          <EditAccessoryTypeModal
            isVisible={true}
            setVisible={() => setEditType(null)}
            accessory={selectedRow}
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

  /*
   * Mantemos a identificação pela coluna ID do objeto original.
   */
  const getRowId = (row, index) =>
    row?.ID ??
    row?.id ??
    row?.recipe_id ??
    row?.component_recipe_id ??
    row?.equipment_recipe_id ??
    index;

  const isRowExpanded = (row, index) => {
    return expandedRow === getRowId(row, index);
  };

  const isRowSelected = (row, index) =>
    selectedRowIds.includes(getRowId(row, index));

  const toggleRowSelection = (row, index) => {
    const id = getRowId(row, index);

    setSelectedRowIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const pageIds = paginatedList.map((row, index) =>
    getRowId(row, startIndex + index),
  );

  const allRowsSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRowIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedRowIds((current) => {
      if (allRowsSelected) {
        return current.filter((id) => !pageIds.includes(id));
      }

      return [...new Set([...current, ...pageIds])];
    });
  };

  const selectedRows = list.filter((row, index) =>
    selectedRowIds.includes(getRowId(row, index)),
  );

  const openDeleteModal = (rows) => {
    setSelectedRow(rows[0] || null);

    setSelectedRowIds(rows.map((row, index) => getRowId(row, index)));

    updateModalDeleteVisible(i.label, true);
  };

  const toggleRow = (row, index) => {
    const id = getRowId(row, index);

    setExpandedRow((current) => (current === id ? null : id));
  };

  const currentModalConfig = modalLabel[i?.label] || {
    title: "",
    body: "",
    deleteFunc: async () => {},
  };

  /*
   * O componente só aparece quando o grupo estiver expandido,
   * exatamente como no comportamento original.
   */
  if (i?.isExpand !== true) {
    return null;
  }

  return (
    <>
      {/* MODAL DE EXCLUSÃO */}
      <AlertModal
        title={
          selectedRows.length > 1
            ? `Excluir ${selectedRows.length} ${i.label.toLowerCase()}s?`
            : currentModalConfig.title
        }
        body={
          selectedRows.length > 1
            ? `Tem certeza que deseja excluir os ${selectedRows.length} itens selecionados? A ação não é reversível.`
            : currentModalConfig.body
        }
        neg_opt="Cancelar"
        pos_opt="Excluir"
        func={async () => {
          const rowsToDelete =
            selectedRows.length > 0
              ? selectedRows
              : selectedRow
                ? [selectedRow]
                : [];

          const tipoPorLabel = {
            Material: "materials",
            Acessório: "accessories",
            Componente: "components",
            Equipamento: "equipments",
          };

          const ids = rowsToDelete.map((row) => Number(row.ID ?? row.id));

          await deleteItemsBatch(tipoPorLabel[i.label], ids);

          await queryClient.invalidateQueries({
            queryKey: [tipoPorLabel[i.label]],
          });

          setSelectedRow(null);
          setSelectedRowIds([]);
          updateModalDeleteVisible(i.label, false);
        }}
        isVisible={modalDeleteVisible[i.label] || false}
        setVisible={() => {
          setSelectedRowIds([]);
          updateModalDeleteVisible(i.label, false);
        }}
        style="waring"
      />

      {/* MODAL DE EDIÇÃO */}
      {renderEditModal()}

      <div className="mt-4 flex max-h-[500px] w-full flex-col overflow-hidden border border-[#DFE1E6] bg-white">
        {/* CABEÇALHO DA TABELA */}
        {selectedRows.length > 0 && (
          <div className="flex h-10 items-center justify-between border-b border-[#DFE1E6] bg-[#DEEBFF] px-3">
            <span className="text-[11px] font-semibold text-[#0052CC]">
              {selectedRows.length} selecionado
              {selectedRows.length === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              onClick={() => openDeleteModal(selectedRows)}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#FFBDAD] bg-white px-2.5 text-[10px] font-semibold text-[#DE350B] transition hover:bg-[#FFEBE6]"
            >
              <FiTrash2 size={12} />
              Excluir selecionados
            </button>
          </div>
        )}
        {list.length > 0 && (
          <div className="min-h-0 w-full flex-1 overflow-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="h-10 border-b border-[#C1C7D0] bg-[#F4F5F7]">
                  <th className="w-10 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={allRowsSelected}
                      onChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                      className="h-3.5 w-3.5 accent-[#0052CC]"
                    />
                  </th>
                  {Object.keys(list[0]).map(
                    (col, index) =>
                      index > 0 && (
                        <th
                          key={col}
                          className="border-r border-[#DFE1E6] px-3 py-1 text-left last:border-r-0"
                        >
                          <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                            {col.replaceAll("_", " ")}
                          </span>
                        </th>
                      ),
                  )}

                  <th className="w-[125px] px-3 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Ações
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedList.map((row, idx) => {
                  const globalIndex = startIndex + idx;
                  const expanded = isRowExpanded(row, globalIndex);

                  return (
                    <React.Fragment key={getRowId(row, idx)}>
                      {/* LINHA PRINCIPAL */}
                      <tr
                        className={`
                          h-8
                          border-b
                          border-[#DFE1E6]
                          transition-colors
                          ${
                            expanded
                              ? "bg-[#DEEBFF]"
                              : idx % 2 === 0
                                ? "bg-white hover:bg-[#EBECF0]"
                                : "bg-[#F4F5F7] hover:bg-[#EBECF0]"
                          }
                        `}
                      >
                        <td className="w-10 border-r border-[#DFE1E6] px-2 text-center">
                          <input
                            type="checkbox"
                            checked={isRowSelected(row, idx)}
                            onChange={() => toggleRowSelection(row, idx)}
                            aria-label={`Selecionar ${getRowId(row, idx)}`}
                            className="h-3.5 w-3.5 accent-[#0052CC]"
                          />
                        </td>
                        {Object.values(row).map(
                          (val, colIndex) =>
                            colIndex > 0 && (
                              <td
                                key={colIndex}
                                className="border-r border-[#DFE1E6] px-3 last:border-r-0"
                              >
                                <span
                                  className={`
                                    block truncate text-xs
                                    ${
                                      colIndex === 1
                                        ? "font-medium text-[#172B4D]"
                                        : "text-[#5E6C84]"
                                    }
                                  `}
                                  title={String(val ?? "-")}
                                >
                                  {val ?? "-"}
                                </span>
                              </td>
                            ),
                        )}

                        {/* AÇÕES */}
                        <td className="px-2">
                          <div className="flex items-center justify-center gap-1">
                            {/* VISUALIZAR */}

                            {/* EDITAR */}
                            <button
                              type="button"
                              onClick={() => openEditModal(i.label, row)}
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                text-[#5E6C84]
                                transition-colors
                                hover:bg-[#DEEBFF]
                                hover:text-[#0052CC]
                              "
                              title="Editar"
                            >
                              <FiEdit2 size={13} />
                            </button>

                            {/* EXCLUIR */}
                            <button
                              type="button"
                              onClick={() => openDeleteModal([row])}
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                text-[#5E6C84]
                                transition-colors
                                hover:bg-[#FFEBE6]
                                hover:text-[#DE350B]
                              "
                              title="Excluir"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* LINHA EXPANDIDA */}
                      <RenderSubTable
                        row={row}
                        expandedRow={expandedRow}
                        i={i}
                      />
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ESTADO VAZIO */}
        {list.length === 0 && (
          <div className="flex min-h-[150px] items-center justify-center px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-[#172B4D]">
                Nenhum item cadastrado
              </p>

              <p className="mt-1 text-xs text-[#5E6C84]">
                Não existem registros para exibir nesta categoria.
              </p>
            </div>
          </div>
        )}

        {/* RODAPÉ */}

        <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-t border-[#DFE1E6] bg-[#F4F5F7] px-3 py-2">
          <span className="text-[11px] text-[#5E6C84]">
            {list.length === 0 ? 0 : startIndex + 1}
            {" - "}
            {endIndex}
            {" de "}
            {list.length} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(1, Math.min(prev, totalPages) - 1),
                )
              }
              disabled={page === 1}
              className="rounded border border-[#DFE1E6] bg-white px-3 py-1 text-xs text-[#172B4D] transition hover:bg-[#EBECF0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="whitespace-nowrap text-[11px] font-medium text-[#172B4D]">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={page === totalPages}
              className="rounded border border-[#DFE1E6] bg-white px-3 py-1 text-xs text-[#172B4D] transition hover:bg-[#EBECF0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
