import { useState } from "react";
import PropTypes from "prop-types";

import {
  FaTrash,
} from "react-icons/fa";

import {
  MdEdit,
} from "react-icons/md";

import {
  FiBriefcase,
} from "react-icons/fi";

import DepartmentModalEdit from "./DepartmentModalEdit";

import {
  deleteDepartment,
} from "@services/DepartmentService";

function DepartmentCard({ id, name }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDelete = async () => {
    const CONFIRM = window.confirm(
      `Tem certeza que quer excluir o departamento ${name}`
    );

    if (!CONFIRM) return;

    await deleteDepartment(id);

    window.location.reload();
  };

  return (
    <>
      <DepartmentModalEdit
        visible={isModalOpen}
        setVisible={setModalOpen}
        id={id}
        department={name}
      />

      <div className="group rounded-lg border border-[#DFE1E6] bg-white transition hover:border-[#C1C7D0] hover:bg-[#FAFBFC]">
        <div className="flex min-w-0 items-center gap-3 px-3 py-2.5">
          {/* ícone */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAE6FF] text-[#6554C0]">
            <FiBriefcase size={15} />
          </div>

          {/* nome */}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[12px] font-semibold text-[#172B4D]"
              title={name}
            >
              {name}
            </p>

            <p className="mt-0.5 text-[10px] text-[#6B778C]">
              Departamento
            </p>
          </div>

          {/* ações */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              title="Editar departamento"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B778C] transition hover:bg-[#DEEBFF] hover:text-[#0052CC]"
            >
              <MdEdit size={15} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Excluir departamento"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B778C] transition hover:bg-[#FFEBE6] hover:text-[#DE350B]"
            >
              <FaTrash size={11} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

DepartmentCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

export default DepartmentCard;