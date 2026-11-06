import { IoMdClose } from "react-icons/io";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import SelectMenu from "../../Ui/SelectMenu";

import { updateMaterial } from "@services/MaterialService.js";

export default function EditMaterialModal({
  isVisible,
  setVisible,
  material,
}) {
  const [materialName, setMaterialName] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [materialValue, setMaterialValue] = useState("");
  const [materialUni, setMaterialUni] = useState([]);

  const queryClient = useQueryClient();

  const Unis = useMemo(
    () => [
      { id: 0, label: "t" },
      { id: 1, label: "kg" },
      { id: 2, label: "g" },
      { id: 3, label: "Uni" },
      { id: 4, label: "Caixa" },
      { id: 5, label: "Milheiro" },
      { id: 6, label: "L" },
      { id: 7, label: "ml" },
    ],
    []
  );

  useEffect(() => {
    if (material) {
      setMaterialName(material.Material || "");
      setMaterialDesc(material["Descrição"] || "");

      const value_uni = material["Valor Unitário"]?.split(" ");

      const value = Number(value_uni?.[1] ?? 0);

      const uni_id = Unis.find(
        (unit) =>
          unit.label?.toLowerCase() ===
          value_uni?.[3]?.toLowerCase()
      )?.id;

      setMaterialValue(value || 0);
      setMaterialUni(
        uni_id !== undefined ? [uni_id] : []
      );
    }
  }, [material, Unis]);

  const clearStates = () => {
    setMaterialName("");
    setMaterialDesc("");
    setMaterialValue(0);
    setMaterialUni([]);
    setVisible(false);
  };

  const handleSave = async () => {
    try {
      if (
        materialName === "" ||
        materialUni.length <= 0 ||
        materialValue <= 0
      ) {
        return null;
      }

      const uni = Unis.find(
        (unit) => unit.id === materialUni[0]
      );

      await updateMaterial(
        materialName,
        materialDesc,
        Number(materialValue),
        uni.label,
        material.ID
      );

      queryClient.invalidateQueries(["materials"]);

      clearStates();
    } catch (err) {
      console.error("Erro ao salvar material", err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#172B4D]">
                Editar Material
              </h2>

              <p className="mt-0.5 text-[11px] text-[#6B778C]">
                Atualize as informações do material selecionado.
              </p>
            </div>

            <button
              type="button"
              onClick={clearStates}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-md
                text-[#5E6C84]
                transition
                hover:bg-[#F4F5F7]
                hover:text-[#172B4D]
              "
            >
              <IoMdClose size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="space-y-4 px-5 py-5">
            {/* NOME */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Nome <span className="text-[#DE350B]">*</span>
              </label>

              <input
                type="text"
                placeholder="Digite o nome do material"
                value={materialName}
                onChange={(e) =>
                  setMaterialName(e.target.value)
                }
                required
                className="
                  h-9 w-full rounded-md
                  border border-[#DFE1E6]
                  bg-white px-3
                  text-xs text-[#172B4D]
                  outline-none
                  transition
                  placeholder:text-[#97A0AF]
                  focus:border-[#4C9AFF]
                  focus:ring-2
                  focus:ring-[#DEEBFF]
                "
              />
            </div>

            {/* PREÇO */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Preço <span className="text-[#DE350B]">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6B778C]">
                  R$
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={materialValue}
                  onChange={(e) =>
                    setMaterialValue(e.target.value)
                  }
                  required
                  className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    bg-white
                    pl-9 pr-3
                    text-xs text-[#172B4D]
                    outline-none
                    transition
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                />
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Descrição <span className="text-[#DE350B]">*</span>
              </label>

              <input
                type="text"
                placeholder="Digite a descrição"
                value={materialDesc}
                onChange={(e) =>
                  setMaterialDesc(e.target.value)
                }
                required
                className="
                  h-9 w-full rounded-md
                  border border-[#DFE1E6]
                  bg-white px-3
                  text-xs text-[#172B4D]
                  outline-none
                  transition
                  placeholder:text-[#97A0AF]
                  focus:border-[#4C9AFF]
                  focus:ring-2
                  focus:ring-[#DEEBFF]
                "
              />
            </div>

            {/* UNIDADE */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Unidade <span className="text-[#DE350B]">*</span>
              </label>

              <SelectMenu
                maxSelections={1}
                options={Unis}
                selectedOption={materialUni}
                setSelectedOption={setMaterialUni}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3">
            <button
              type="button"
              onClick={clearStates}
              className="
                h-8 rounded-md
                border border-[#DFE1E6]
                bg-white px-3
                text-[11px] font-medium
                text-[#42526E]
                transition
                hover:bg-[#F4F5F7]
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                h-8 rounded-md
                bg-[#0052CC] px-3.5
                text-[11px] font-semibold
                text-white
                transition
                hover:bg-[#0065FF]
                active:scale-[0.98]
              "
            >
              Salvar Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

