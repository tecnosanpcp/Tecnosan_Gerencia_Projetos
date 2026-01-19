import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import SelectMenu from "../../Ui/SelectMenu";
import { createMaterial } from "@services/MaterialService.js";

export default function AddMaterialModal({ isVisible, setVisible }) {
  const [materialName, setMaterialName] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [materialValue, setMaterialValue] = useState(0);

  const [materialUni, setMaterialUni] = useState([]);

  const Unis = [
    { id: 0, label: "t" },
    { id: 1, label: "kg" },
    { id: 2, label: "g" },
    { id: 3, label: "Uni" },
    { id: 4, label: "Caixa" },
    { id: 5, label: "Milheiro" },
    { id: 6, label: "L" },
    { id: 7, label: "ml" },
  ];

  const clearStates = () => {
    setMaterialName("");
    setMaterialDesc("");
    setMaterialValue(0);
    setMaterialUni([]);
    setVisible(false);
  };

  const handleSave = async () => {
    try {
      if (materialName === "" || materialUni.length <= 0 || materialValue <= 0)
        return null;

      await createMaterial(
        materialName,
        materialDesc,
        materialValue,
        Unis[materialUni].label
      );
      
      clearStates();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar material", err);
    }
  };

  return (
    <>
      {isVisible ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-screen h-screen">
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-[30vw] flex flex-col space-y-8">
            <form
              className="flex flex-col space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Título + botão X */}
              <div className="flex flex-row items-center justify-between">
                <p className="text-lg font-semibold">Adicionar Material</p>

                <button onClick={() => setVisible(false)} type="button">
                  <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
                </button>
              </div>

              {/* Nome do material */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700">Nome *</label>
                <input
                  type="text"
                  className="p-2 rounded"
                  placeholder="Digite o nome do material"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  required
                />
              </div>

              {/* Valor do material */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700">Preço *</label>
                <input
                  type="number"
                  className="p-2 rounded"
                  placeholder="Digite o nome do material"
                  value={materialValue}
                  onChange={(e) => setMaterialValue(e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700">Descrição *</label>
                <input
                  type="text"
                  className="p-2 rounded"
                  placeholder="Digite a descrição"
                  value={materialDesc}
                  onChange={(e) => setMaterialDesc(e.target.value)}
                  required
                />
              </div>

              {/* Unidade */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700">Unidade *</label>
                <SelectMenu
                  maxSelections={1}
                  options={Unis}
                  selectedOption={materialUni}
                  setSelectedOption={setMaterialUni}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-row justify-end items-center space-x-4">
                <button
                  className="p-2 bg-slate-50 hover:bg-gray-300 rounded"
                  onClick={() => {
                    clearStates();
                  }}
                  type="button"
                >
                  Cancelar
                </button>

                <button
                  className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  type="submit"
                >
                  Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
