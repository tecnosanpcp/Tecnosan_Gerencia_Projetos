import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updateAccessory } from "@services/AccessoriesServices.js";

export default function EditAccessoryTypeModal({
  isVisible,
  setVisible,
  accessory,
}) {
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [value, setValue] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (accessory && isVisible) {
      setName(accessory.Acessório || "");

      const serial = accessory["Nº de Série"];
      setSerialNumber(serial === "-" ? "" : serial);

      const rawValue = accessory["Valor"];
      let numValue = 0;

      if (typeof rawValue === "string") {
        numValue = Number(
          rawValue
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
        );
      } else {
        numValue = Number(rawValue);
      }

      setValue(isNaN(numValue) ? 0 : numValue);

      const rawDate = accessory["Data da Compra"];

      if (rawDate && rawDate !== "-") {
        const parts = rawDate.split("/");

        if (parts.length === 3) {
          setPurchaseDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          setPurchaseDate("");
        }
      } else {
        setPurchaseDate("");
      }
    }
  }, [accessory, isVisible]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!accessory?.ID) return;

      await updateAccessory(
        accessory.ID,
        name,
        serialNumber,
        value,
        purchaseDate
      );

      queryClient.invalidateQueries(["accessories"]);
      setVisible(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao salvar.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-[0_20px_60px_rgba(9,30,66,0.20)]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#172B4D]">
              Editar Acessório
            </h2>

            <p className="mt-0.5 text-[11px] text-[#6B778C]">
              Atualize as informações do acessório.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
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
        <form onSubmit={handleSave}>
          <div className="space-y-4 px-5 py-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Nome <span className="text-[#DE350B]">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="
                  h-9 w-full rounded-md
                  border border-[#DFE1E6]
                  bg-white px-3
                  text-xs text-[#172B4D]
                  outline-none
                  transition
                  focus:border-[#4C9AFF]
                  focus:ring-2
                  focus:ring-[#DEEBFF]
                "
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                Número de Série
              </label>

              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="
                  h-9 w-full rounded-md
                  border border-[#DFE1E6]
                  bg-white px-3
                  text-xs text-[#172B4D]
                  outline-none
                  transition
                  focus:border-[#4C9AFF]
                  focus:ring-2
                  focus:ring-[#DEEBFF]
                "
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Data de Compra
                </label>

                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    bg-white px-3
                    text-xs text-[#172B4D]
                    outline-none
                    transition
                    focus:border-[#4C9AFF]
                    focus:ring-2
                    focus:ring-[#DEEBFF]
                  "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#172B4D]">
                  Valor (R$)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="
                    h-9 w-full rounded-md
                    border border-[#DFE1E6]
                    bg-white px-3
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
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3">
            <button
              type="button"
              onClick={() => setVisible(false)}
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}