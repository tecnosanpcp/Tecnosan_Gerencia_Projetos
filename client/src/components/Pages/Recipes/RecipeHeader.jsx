import React, { useState } from "react";

import AddMaterialModal from "./AddMaterialModal";
import AddComponenteRecipeModal from "./AddComponentRecipeModal";
import AddEquipmentRecipeModal from "./AddEquipmentRecipeModal";
import AddAccessoryTypeModal from "./AddAccessoryTypeModal";

export default function RecipeHeader({ i, importAction }) {
  const [isAddModalVisible, setAddModalVisible] = useState({
    Material: false,
    Acessório: false,
    Componente: false,
    Equipamento: false,
  });

  const [searchText, setSearchText] = useState("");

  const toggleModal = (key) => {
    setAddModalVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Busca instantânea enquanto digita
  const handleSearch = (event) => {
    const value = event.target.value;

    setSearchText(value);
    i.setSearch(value);
  };

  const clearSearch = () => {
    setSearchText("");
    i.setSearch("");
  };

  const getIcon = () => {
    switch (i.label) {
      case "Material":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
          </svg>
        );

      case "Acessório":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="m14.5 6.5 3 3" />
            <path d="M13 5a4 4 0 0 1 5.7 5.6l-8.6 8.7a2.4 2.4 0 0 1-3.4 0l-.3-.3a2.4 2.4 0 0 1 0-3.4L15 7" />
            <path d="m5 19 2 2" />
          </svg>
        );

      case "Componente":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="4" y="4" width="7" height="7" rx="1" />
            <rect x="13" y="13" width="7" height="7" rx="1" />
            <path d="M11 7.5h2M16.5 11v2" />
          </svg>
        );

      case "Equipamento":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 3h6v4H9z" />
            <path d="M6 7h12v14H6z" />
            <path d="M9 11h6M9 15h6M9 18h3" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* MODAIS */}

      <AddMaterialModal
        isVisible={isAddModalVisible.Material}
        setVisible={() => toggleModal("Material")}
      />

      <AddAccessoryTypeModal
        isVisible={isAddModalVisible.Acessório}
        setVisible={() => toggleModal("Acessório")}
      />

      <AddComponenteRecipeModal
        isVisible={isAddModalVisible.Componente}
        setVisible={() => toggleModal("Componente")}
      />

      <AddEquipmentRecipeModal
        isVisible={isAddModalVisible.Equipamento}
        setVisible={() => toggleModal("Equipamento")}
      />

      {/* HEADER */}

      <div
        className={[
          "w-full rounded-[4px] border border-[#DFE1E6] bg-white",
          "shadow-[0_1px_2px_rgba(9,30,66,0.08)]",
          i.isExpand ? "rounded-b-none border-b-0" : "",
        ].join(" ")}
      >
        <div
          className="
    flex min-h-[56px] w-full
    items-center
    gap-3
    px-3 py-2
    sm:px-4
  "
        >
          {/* ESQUERDA — CLICÁVEL ATÉ A BUSCA */}

          <button
            type="button"
            onClick={() => i.setExpand(!i.isExpand)}
            className="
      flex h-[36px] min-w-0 flex-1
      items-center gap-2.5
      rounded-md
      px-1
      text-left
      transition
      hover:bg-[#F4F5F7]
    "
          >
            <div
              className="
        flex h-7 w-7 shrink-0
        items-center justify-center
        rounded-[4px]
        bg-[#DEEBFF]
        text-[#0052CC]
      "
            >
              {getIcon()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-xs font-semibold text-[#172B4D]">
                  {i.label}
                </h2>

                <span className="shrink-0 rounded-full bg-[#F4F5F7] px-1.5 py-0.5 text-[9px] font-semibold text-[#5E6C84]">
                  {i.total}
                </span>
              </div>

              <p className="mt-0.5 truncate text-[10px] leading-3 text-[#97A0AF]">
                {i.description}
              </p>
            </div>
          </button>

          {/* DIREITA */}

          <div
            className="
      flex shrink-0
      items-center
      gap-2
    "
          >
            {/* BUSCA */}
            {importAction && (
              <button
                type="button"
                onClick={importAction}
                className="
      inline-flex h-8
      shrink-0
      items-center justify-center
      rounded-[4px]
      border border-[#DFE1E6]
      bg-white
      px-3
      text-[11px]
      font-semibold
      text-[#172B4D]
      transition
      hover:bg-[#F4F5F7]
      active:scale-[0.98]
    "
              >
                Importar
              </button>
            )}
            <div className="w-[220px] shrink-0">
              <div className="relative flex w-full">
                <svg
                  className="
            pointer-events-none absolute
            left-2.5 top-1/2
            -translate-y-1/2
            text-[#97A0AF]
          "
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearch}
                  placeholder={`Buscar ${i.label.toLowerCase()}...`}
                  className="
            h-8 w-full
            rounded-[4px]
            border border-[#DFE1E6]
            bg-white
            pl-8 pr-8
            text-[11px]
            text-[#172B4D]
            outline-none
            transition
            focus:border-[#4C9AFF]
            focus:ring-1
            focus:ring-[#DEEBFF]
          "
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="
              absolute right-1.5 top-1/2
              flex h-5 w-5
              -translate-y-1/2
              items-center justify-center
              rounded
              text-xs
              text-[#5E6C84]
              hover:bg-[#F4F5F7]
            "
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* ADICIONAR */}

            <button
              type="button"
              onClick={() => toggleModal(i.label)}
              className="
        inline-flex h-8 w-[150px]
        shrink-0
        items-center justify-center
        gap-1.5
        rounded-[4px]
        bg-[#0052CC]
        px-2.5
        text-[11px]
        font-semibold
        text-white
        transition
        hover:bg-[#0065FF]
        active:scale-[0.98]
      "
            >
              <span className="text-sm leading-none">+</span>

              <span className="truncate">Adicionar {i.label}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
