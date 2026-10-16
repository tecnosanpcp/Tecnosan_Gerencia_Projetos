import { IoMdClose } from "react-icons/io";
import { FiPlus, FiBriefcase } from "react-icons/fi";
import PropTypes from "prop-types";
import { useState } from "react";

import { createDeparment } from "@services/DepartmentService";

function DepartmentModalRegister({ visible, setVisible, onDepartmentChanged }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await createDeparment(departmentName);

      if (onDepartmentChanged) {
        await onDepartmentChanged();
      }

      setDepartmentName("");
      setVisible(false);
    } catch (error) {
      console.error("Erro ao cadastrar departamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#091E42]/55 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setVisible(false);
        }
      }}
    >
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-2xl">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.requestSubmit();
            }
          }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAE6FF] text-[#6554C0]">
                <FiPlus size={18} />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold text-[#172B4D]">
                  Novo departamento
                </h2>

                <p className="mt-0.5 text-[11px] text-[#6B778C]">
                  Cadastre uma nova área da empresa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B778C] transition hover:bg-[#F4F5F7] hover:text-[#172B4D]"
              aria-label="Fechar"
            >
              <IoMdClose size={19} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="px-5 py-5">
            <label
              htmlFor="department_name"
              className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#172B4D]"
            >
              <FiBriefcase size={14} className="text-[#6B778C]" />
              Nome do departamento
              <span className="text-[#DE350B]">*</span>
            </label>

            <input
              autoFocus
              type="text"
              id="department_name"
              name="department_name"
              placeholder="Digite o nome do novo departamento"
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
              required
              className="h-10 w-full rounded-md border border-[#DFE1E6] bg-white px-3 text-[12px] text-[#172B4D] outline-none transition placeholder:text-[#97A0AF] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]"
            />
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#DFE1E6] bg-[#FAFBFC] px-5 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="h-9 rounded-md border border-[#DFE1E6] bg-white px-4 text-[12px] font-semibold text-[#172B4D] transition hover:bg-[#F4F5F7]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-9 rounded-md px-5 text-[12px] font-semibold text-white transition active:scale-[0.98] ${
                isSubmitting
                  ? "cursor-not-allowed bg-[#97A0AF]"
                  : "bg-[#0052CC] hover:bg-[#0065FF]"
              }`}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar departamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

DepartmentModalRegister.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  onDepartmentChanged: PropTypes.func,
};

export default DepartmentModalRegister;
