import { IoMdClose } from "react-icons/io";
import {
  FiEdit3,
  FiBriefcase,
} from "react-icons/fi";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { editDepartment } from "@services/DepartmentService";

function DepartmentModalEdit({
  visible,
  setVisible,
  department,
  id,
}) {
  const [departmentName, setDepartmentName] = useState(
    department?.department_name || ""
  );

  useEffect(() => {
    setDepartmentName(
      department?.department_name || ""
    );
  }, [department]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await editDepartment(id, departmentName);

      setVisible(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao editar departamento:", error);
      alert("Erro ao editar departamento.");
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DEEBFF] text-[#0052CC]">
                <FiEdit3 size={18} />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold text-[#172B4D]">
                  Editar departamento
                </h2>

                <p className="mt-0.5 text-[11px] text-[#6B778C]">
                  Altere o nome do departamento.
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
              <FiBriefcase
                size={14}
                className="text-[#6B778C]"
              />

              Nome do departamento

              <span className="text-[#DE350B]">*</span>
            </label>

            <input
              autoFocus
              type="text"
              id="department_name"
              name="department_name"
              placeholder="Digite o novo nome do departamento"
              value={departmentName}
              onChange={(event) =>
                setDepartmentName(event.target.value)
              }
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
              className="h-9 rounded-md bg-[#0052CC] px-5 text-[12px] font-semibold text-white transition hover:bg-[#0065FF] active:scale-[0.98]"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

DepartmentModalEdit.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  department: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};

export default DepartmentModalEdit;