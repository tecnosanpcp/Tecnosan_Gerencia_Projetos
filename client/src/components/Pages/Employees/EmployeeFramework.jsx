import { useState } from "react";
import AlertModal from "../../Ui/AlertModal.jsx";
import {
  FaUserCircle,
  FaUserEdit,
  FaTrash,
  FaAngleDown,
  FaAngleUp,
  FaRegAddressCard,
} from "react-icons/fa";

import { CiBadgeDollar, CiCalendar } from "react-icons/ci";

import { IoTimeOutline } from "react-icons/io5";

import { BsBarChartLine } from "react-icons/bs";

import EditEmployeeModal from "./EditEmployeeModal";

export default function EmployeeFramework(props) {
  const {
    user_id,
    employee_name,
    employee_office,
    employee_pay,
    employee_absences,
    employee_overtime,
    employee_performance,
    onEmployeeChanged,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const name = employee_name || "Sem nome";
  const office = employee_office || "Cargo não informado";
  const pay = employee_pay ?? 0;
  const absences = employee_absences ?? 0;
  const overtime = employee_overtime ?? 0;

  const performanceValue =
    employee_performance === null || employee_performance === undefined
      ? 100
      : Number(employee_performance) * 100;

  const performance = Number.isFinite(performanceValue)
    ? performanceValue
    : 100;

  const deleteEmployee = async () => {
    // Mantido conforme implementação atual.
    // O projeto ainda não possui service de exclusão de funcionário.
  };
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  return (
    <>
      <EditEmployeeModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        user_id={user_id}
      />
      <AlertModal
        title="Quer excluir esse colaborador?"
        body="Tem certeza que quer excluir esse colaborador? A ação não é reversível."
        neg_opt="Cancelar"
        pos_opt="Excluir"
        func={async () => {
          await deleteEmployee();

          setIsDeleteModalVisible(false);

          if (onEmployeeChanged) {
            await onEmployeeChanged();
          }
        }}
        isVisible={isDeleteModalVisible}
        setVisible={setIsDeleteModalVisible}
        style="waring"
      />
      <article
        className={[
          "group flex min-w-0 flex-col overflow-hidden rounded-lg",
          "border border-[#DFE1E6] bg-white",
          "transition-all duration-150",
          "hover:border-[#B3D4FF] hover:shadow-sm",
          isExpanded ? "ring-1 ring-[#DEEBFF]" : "",
        ].join(" ")}
      >
        {/* CARD PRINCIPAL */}
        <div className="flex min-w-0 items-center gap-3 px-3.5 py-3">
          {/* avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DEEBFF] text-[#0052CC]">
            <FaUserCircle size={25} />
          </div>

          {/* informações */}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-semibold text-[#172B4D]"
              title={name}
            >
              {name}
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[#6B778C]">
              <FaRegAddressCard size={11} className="shrink-0" />

              <span className="truncate text-[11px]" title={office}>
                {office}
              </span>
            </div>
          </div>

          {/* expandir */}
          <button
            type="button"
            aria-label={
              isExpanded ? "Recolher colaborador" : "Expandir colaborador"
            }
            onClick={() => setIsExpanded((current) => !current)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#6B778C] transition hover:bg-[#F4F5F7] hover:text-[#172B4D]"
          >
            {isExpanded ? <FaAngleUp size={14} /> : <FaAngleDown size={14} />}
          </button>
        </div>

        {/* DETALHES */}
        {isExpanded && (
          <div className="border-t border-[#DFE1E6] bg-[#FAFBFC] px-3.5 py-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* salário */}
              <div className="rounded-md border border-[#DFE1E6] bg-white px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <CiBadgeDollar
                    size={18}
                    className="shrink-0 text-[#00875A]"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#97A0AF]">
                      Salário
                    </p>

                    <p className="truncate text-[12px] font-semibold text-[#172B4D]">
                      R$ {pay}
                    </p>
                  </div>
                </div>
              </div>

              {/* faltas */}
              <div className="rounded-md border border-[#DFE1E6] bg-white px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <CiCalendar size={18} className="shrink-0 text-[#DE350B]" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#97A0AF]">
                      Faltas
                    </p>

                    <p className="truncate text-[12px] font-semibold text-[#172B4D]">
                      {absences}
                    </p>
                  </div>
                </div>
              </div>

              {/* desempenho */}
              <div className="rounded-md border border-[#DFE1E6] bg-white px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <BsBarChartLine
                    size={16}
                    className="shrink-0 text-[#0052CC]"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#97A0AF]">
                      Desempenho
                    </p>

                    <p className="truncate text-[12px] font-semibold text-[#172B4D]">
                      {performance.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* horas extras */}
              <div className="rounded-md border border-[#DFE1E6] bg-white px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <IoTimeOutline
                    size={17}
                    className="shrink-0 text-[#6554C0]"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#97A0AF]">
                      Horas extras
                    </p>

                    <p className="truncate text-[12px] font-semibold text-[#172B4D]">
                      {overtime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ações */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsModalVisible(true)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#DFE1E6] bg-white text-[11px] font-semibold text-[#0052CC] transition hover:border-[#B3D4FF] hover:bg-[#DEEBFF]"
              >
                <FaUserEdit size={12} />
                Editar
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalVisible(true)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#FFBDAD] bg-white text-[11px] font-semibold text-[#DE350B] transition hover:bg-[#FFEBE6]"
              >
                <FaTrash size={11} />
                Remover
              </button>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
