import { FaCalendar, FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";

export default function ProductionHeader({ 
  weekDays, 
  setIsAddOpen, 
  offset, 
  setOffset,
  onDownloadPDF, // <--- Prop nova
  onDownloadExcel // <--- Prop nova
}) {
  const startDate = weekDays[0]?.formatted.split(" ")[1];
  const endDate = weekDays[6]?.formatted.split(" ")[1];

  return (
    <div className="card items-center justify-between ">
      {/* Título e Data */}
      <div className="flex flex-row items-center space-x-2">
        <FaCalendar className="h-5 w-5" />
        <span>
          <h2 className="text-lg font-semibold">Quadro de Produção</h2>
          <h3 className="font-light text-gray-600">
            Semana {startDate} até {endDate}
          </h3>
        </span>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-row items-center space-x-4">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex flex-row items-center px-3 py-2 rounded-md space-x-1 bnt-add"
        >
          <IoMdAdd />
          <p>Adicionar Componente</p>
        </button>
        
        {/* Botão PDF */}
        <button 
          onClick={onDownloadPDF}
          className="flex flex-row items-center space-x-1 border p-2 rounded-lg hover:bg-gray-200 text-red-600 border-red-200 "
        >
          <MdOutlineFileDownload /> <p>PDF</p>
        </button>
        
        {/* Botão Excel */}
        <button 
          onClick={onDownloadExcel}
          className="flex flex-row items-center space-x-1 border p-2 rounded-lg hover:bg-gray-200 text-green-600 border-green-200 "
        >
          <MdOutlineFileDownload /> <p>Excel</p>
        </button>

        {/* Navegação */}
        <button
          onClick={() => setOffset(offset - 1)}
          className="flex flex-row items-center space-x-1 border p-2 rounded-lg hover:bg-gray-200"
        >
          <FaLongArrowAltLeft />
        </button>
        
        <button
          onClick={() => setOffset(0)}
          className="flex flex-row items-center space-x-1 border p-2 rounded-lg hover:bg-gray-200"
        >
          <TfiReload />
        </button>
        
        <button
          onClick={() => setOffset(offset + 1)}
          className="flex flex-row items-center space-x-1 border p-2 rounded-lg hover:bg-gray-200"
        >
          <FaLongArrowAltRight />
        </button>
      </div>
    </div>
  );
}