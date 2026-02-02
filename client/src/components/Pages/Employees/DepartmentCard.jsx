import DepartmentModalEdit from "./DepartmentModalEdit";
import PropTypes from "prop-types";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { deleteDepartment } from "@services/DepartmentService";

function DepartmentCard({ id, name }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDelete = async () => {
    const CONFIRM = confirm(
      `Tem certeza que quer excluir o departamento ${name}`
    );
    if (CONFIRM) {
      await deleteDepartment(id);
    }
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

      <div className="flex flex-col justify-items-center align-self-middle p-4 bg-white shadow-md shadow-slate-400 rounded-md w-full">
        <div className="flex flex-row justify-between px-4">
          <p className="font-medium text-base	flex flex-col ml-2 justify-center">
            {name}
          </p>
          <div className="flex space-x-4">
            <button onClick={() => setModalOpen(!isModalOpen)}>
              <MdEdit size={20} />
            </button>
            <button onClick={() => handleDelete()}>
              <FaTrash size={15} />
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
