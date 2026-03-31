import React, { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

import AddMaterialModal from "./AddMaterialModal";
import AddComponenteRecipeModal from "./AddComponentRecipeModal";
import AddEquipmentRecipeModal from "./AddEquipmentRecipeModal";
import AddAccessoryTypeModal from "./AddAccessoryTypeModal"; // <--- Import Novo

export default function RecipeHeader({ i }) {
  const [isAddModalVisible, setAddModalVisible] = useState({
    Material: false,
    Acessório: false,
    Componente: false,
    Equipamento: false,
  });

  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    i.setSearch(searchText);
  };

  const toggleModal = (key) => {
    setAddModalVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <React.Fragment key={i.label}>
      {/* Modais */}
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

      {/* Header */}
      <div className="card justify-between items-center overflow-auto mt-4">
        <h1 className="text-base font-bold text-gray-700">{i.label}</h1>

        <div className="flex flex-row space-x-4">
          <form className="flex flex-row space-x-4" onSubmit={handleSearch}>
            <input
              type="text"
              className="border hover:border-gray-300 rounded-md py-1 px-2 outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`Buscar ${i.label}...`}
            />
            <button className="bg-gray-100 p-2 rounded hover:bg-gray-200">
              Pesquisar
            </button>
          </form>

          <button className="bnt-add w-44" onClick={() => toggleModal(i.label)}>
            Adicionar {i.label}
          </button>

          <button
            className="bg-gray-100 p-2 rounded hover:bg-gray-200"
            onClick={() => i.setExpand(!i.isExpand)}
          >
            {i.isExpand ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}
