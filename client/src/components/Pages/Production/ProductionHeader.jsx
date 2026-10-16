import {
  FaCalendar,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
} from "react-icons/fa";

import { IoMdAdd } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";

export default function ProductionHeader({
  weekDays,
  setIsAddOpen,
  offset,
  setOffset,
  onDownloadPDF,
  onDownloadExcel,
}) {
  const startDate = weekDays[0]?.formatted.split(" ")[1];
  const endDate = weekDays[6]?.formatted.split(" ")[1];

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        px-4
        py-3
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* =====================================================
          TÍTULO
          ===================================================== */}

      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#DEEBFF]
            text-[#0052CC]
          "
        >
          <FaCalendar className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[#172B4D]">
            Quadro de Produção
          </h2>

          <p className="text-xs text-[#5E6C84]">
            Semana {startDate} até {endDate}
          </p>
        </div>
      </div>

      {/* =====================================================
          AÇÕES
          ===================================================== */}

      <div className="flex flex-wrap items-center gap-2">
        {/* Adicionar */}

        <button
          type="button"
          onClick={() => setIsAddOpen()}
          className="
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-md
            bg-[#0052CC]
            px-3
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#0065FF]
          "
        >
          <IoMdAdd className="h-4 w-4" />

          <span>Adicionar Componente</span>
        </button>

        {/* PDF */}

        <button
          type="button"
          onClick={onDownloadPDF}
          className="
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-md
            border
            border-[#FFBDAD]
            bg-white
            px-3
            text-sm
            font-medium
            text-[#DE350B]
            transition
            hover:bg-[#FFEBE6]
          "
        >
          <MdOutlineFileDownload className="h-4 w-4" />

          <span>PDF</span>
        </button>

        {/* Excel */}

        <button
          type="button"
          onClick={onDownloadExcel}
          className="
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-md
            border
            border-[#ABF5D1]
            bg-white
            px-3
            text-sm
            font-medium
            text-[#00875A]
            transition
            hover:bg-[#E3FCEF]
          "
        >
          <MdOutlineFileDownload className="h-4 w-4" />

          <span>Excel</span>
        </button>

        {/* Navegação */}

        <div className="ml-1 flex items-center">
          <button
            type="button"
            onClick={() => setOffset(offset - 1)}
            title="Semana anterior"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-l-md
              border
              border-r-0
              border-[#DFE1E6]
              bg-white
              text-[#5E6C84]
              transition
              hover:bg-[#F4F5F7]
              hover:text-[#172B4D]
            "
          >
            <FaLongArrowAltLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setOffset(0)}
            title="Semana atual"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              border
              border-[#DFE1E6]
              bg-white
              text-[#5E6C84]
              transition
              hover:bg-[#F4F5F7]
              hover:text-[#172B4D]
            "
          >
            <TfiReload className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setOffset(offset + 1)}
            title="Próxima semana"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-r-md
              border
              border-l-0
              border-[#DFE1E6]
              bg-white
              text-[#5E6C84]
              transition
              hover:bg-[#F4F5F7]
              hover:text-[#172B4D]
            "
          >
            <FaLongArrowAltRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}