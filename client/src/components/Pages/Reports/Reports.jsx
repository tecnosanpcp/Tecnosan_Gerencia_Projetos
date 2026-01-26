import { useState, useEffect, useCallback, useMemo } from "react";

// UI Components
import NavBar from "../../Ui/NavBar";
import CascadeTable from "../../Ui/CascadeTable";
import CascadeTableTwoLevel from "../../Ui/CascadeTableTwoLevel";
import InfoCard from "../../Ui/InfoCard";
import SelectMenu from "../../Ui/SelectMenu";
import ProjectEvolutionGraph from "./ProjectEvolutionGraph";
import TotalConsumptionGraph from "./TotalConsumptionGraph";
import LeadTimeGraph from "./LeadTimeGraph";

// Services
import { listProjects } from "@services/ProjectService";
import { getEquipment } from "@services/EquipmentService";
import { VerifyAuth } from "@services/AuthService";
import { countStatusComponentsByProj } from "@services/ComponentsServices";
import {
  vwProjectConsumedMaterials,
  vwProjectDepartmentDelays,
} from "@services/ViewsService";
import { getLeadTimeVsReal } from "@services/ComponentsServices";

// Utils
import { getDefaultDateRange, formatDateForApi } from "../../../utils/dateUtils";

// Assets
import entrega from "@imgs/entrega.png";
import caixa from "@imgs/caixa.png";

// Libs para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Icons
import { FaSpinner } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md"; // Ícone usado na outra página

export default function Reports() {
  // --- Estados de Filtros ---
  const defaultDates = getDefaultDateRange(3);
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [selectedProj, setSelectedProj] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- Estados de Dados ---
  const [projects, setProjects] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [dataConsumedMaterials, setDataConsumedMaterials] = useState([]);
  const [processDelaysList, setProcessDelaysList] = useState([]);
  const [countStatusGraph, setCountStatusGraph] = useState([]); 
  const [leadTimeData, setLeadTimeData] = useState([]);
  
  // Estado de loading do PDF
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // --- Lógica de Processamento ---
  const { chartData, cardMetrics } = useMemo(() => {
    const metrics = { completed: 0, pending: 0 };
    const equipmentMap = new Map();

    if (!countStatusGraph || countStatusGraph.length === 0) {
      return { chartData: { categories: [], series: [] }, cardMetrics: metrics };
    }

    countStatusGraph.forEach((item) => {
      const equipName = item.equipment_name;
      const qtd = Number(item.numero_pecas) || 0;
      const status = (item.status || "").trim();

      if (status === "Completed") {
        metrics.completed += qtd;
      } else {
        metrics.pending += qtd;
      }

      if (!equipmentMap.has(equipName)) {
        equipmentMap.set(equipName, { entregues: 0, pendentes: 0 });
      }
      const entry = equipmentMap.get(equipName);

      if (status === "Completed") entry.entregues += qtd;
      else entry.pendentes += qtd;
    });

    const categories = Array.from(equipmentMap.keys());
    const series = [
      { name: "Entregues", data: categories.map((cat) => equipmentMap.get(cat).entregues) },
      { name: "Pendentes", data: categories.map((cat) => equipmentMap.get(cat).pendentes) },
    ];

    return { chartData: { categories, series }, cardMetrics: metrics };
  }, [countStatusGraph]);

  // --- Buscas ---
  useEffect(() => {
    let isMounted = true;
    const fetchOptionsData = async () => {
      const user = await VerifyAuth();
      if (user && isMounted) {
        setCurrentUserId(user.user_id);
        const [projData, equipData] = await Promise.all([
          listProjects(user.user_id),
          getEquipment(user.user_id),
        ]);
        setProjects(projData || []);
        setEquipments(equipData || []);
      }
    };
    fetchOptionsData();
    return () => { isMounted = false; };
  }, []);

  const fetchDashboardMetrics = useCallback(async () => {
    if (!currentUserId) return;
    const projId = selectedProj.length > 0 ? selectedProj[0] : null;
    const equipId = selectedEquip.length > 0 ? selectedEquip[0] : null;

    try {
      const start = formatDateForApi(startDate);
      const end = formatDateForApi(endDate);

      const [graphRes, leadRes, matRes, delayRes] = await Promise.all([
        countStatusComponentsByProj(projId, equipId, start, end),
        getLeadTimeVsReal(projId, equipId, start, end),
        vwProjectConsumedMaterials(currentUserId, projId, start, end),
        vwProjectDepartmentDelays(projId)
      ]);

      setCountStatusGraph(graphRes || []);
      setLeadTimeData(leadRes || []);
      
      const matFiltered = (matRes || []).filter(m => projId ? m.project_id === projId : true);
      setDataConsumedMaterials(matFiltered);
      setProcessDelaysList(delayRes || []);

    } catch (error) {
      console.error("Erro metrics:", error);
    }
  }, [selectedProj, selectedEquip, startDate, endDate, currentUserId]);

  useEffect(() => { fetchDashboardMetrics(); }, [fetchDashboardMetrics]);

  // --- Função de Exportação PDF ---
  const handleExportPDF = async () => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let currentY = 15;

    // 1. Cabeçalho do PDF
    doc.setFontSize(16);
    doc.text("Relatório de Dashboard", margin, currentY);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - margin, currentY, { align: "right" });
    currentY += 10;

    doc.text(`Período: ${new Date(startDate).toLocaleDateString("pt-BR")} a ${new Date(endDate).toLocaleDateString("pt-BR")}`, margin, currentY);
    currentY += 10;

    // Função auxiliar para capturar gráfico
    const addChartToPdf = async (elementId, title) => {
      const element = document.getElementById(elementId);
      if (element) {
        if (currentY > 270) { doc.addPage(); currentY = 15; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, currentY);
        currentY += 5;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = pageWidth - (margin * 2);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (currentY + pdfHeight > 280) { doc.addPage(); currentY = 15; }
            
            doc.addImage(imgData, "PNG", margin, currentY, pdfWidth, pdfHeight);
            currentY += pdfHeight + 10;
        } catch (err) {
            console.error("Erro ao capturar gráfico", err);
        }
      }
    };

    // 2. Captura Gráficos
    await addChartToPdf("chart-evolution", "Evolução por Equipamento");
    await addChartToPdf("chart-consumption", "Consumo de Materiais");
    await addChartToPdf("chart-leadtime", "Lead Time Real vs Previsto");

    // 3. Tabela de Detalhamento
    if (currentY > 250) { doc.addPage(); currentY = 15; }
    doc.setFontSize(12);
    doc.text("Detalhamento de Consumo", margin, currentY);
    currentY += 5;

    const consumptionRows = dataConsumedMaterials.map(item => [
      item.project_name || "-",
      item.material_name || "-",
      `${Number(item.total_material_consumed || 0).toFixed(2)} kg`,
      `R$ ${Number(item.total_value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Projeto", "Material", "Qtd (kg)", "Valor (R$)"]],
      body: consumptionRows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // 4. Tabela de Atrasos
    if (currentY > 250) { doc.addPage(); currentY = 15; }
    doc.setFontSize(12);
    doc.text("Processos em Atraso", margin, currentY);
    currentY += 5;

    const delayRows = processDelaysList.map(item => [
      item.component_name || "-",
      item.department_name || "-",
      `${item.total_delay_time?.days || 0} dias`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Componente", "Departamento", "Atraso"]],
      body: delayRows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] }
    });

    doc.save("Relatorio_Producao.pdf");
    setIsGeneratingPdf(false);
  };

  const uniqueMaterialNames = [...new Set(dataConsumedMaterials.map((p) => p.material_name))].filter(Boolean);

  const customScrollbarClass = `
    [&::-webkit-scrollbar]:w-2 
    [&::-webkit-scrollbar]:h-2 
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:bg-gray-300 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
  `;

  const cardStyle = "bg-white p-4 rounded-lg shadow-md border-t-4 flex flex-col";
  const tableContainerStyle = `flex-1 w-full min-h-0 overflow-auto border border-gray-100 rounded bg-gray-50/50 ${customScrollbarClass}`;

  return (
    <div className="min-h-screen w-full pb-16 bg-gray-50 overflow-x-hidden">
      <NavBar select_index={3} />

      {/* HEADER DE FILTROS */}
      <div className="sticky top-0 z-20 mx-4 mt-4 mb-6">
        <div className="flex flex-row bg-white py-3 px-4 items-center justify-between shadow-md rounded-lg border-l-4 border-green-500">
          
          <h2 className="font-bold text-xl text-gray-800">Dashboard</h2>

          <div className="flex flex-row space-x-6 items-end">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Projeto</p>
              <SelectMenu className="h-8 w-48" maxSelections={1} options={projects.map(p => ({ id: p.project_id, label: p.project_name }))} selectedOption={selectedProj} setSelectedOption={setSelectedProj} />
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Equipamento</p>
              <SelectMenu className="h-8 w-48" maxSelections={1} options={equipments.map(e => ({ id: e.equipment_id, label: e.equipment_name }))} selectedOption={selectedEquip} setSelectedOption={setSelectedEquip} />
            </div>
            
            <div className="flex flex-col">
              <p className="self-center text-xs font-bold text-gray-500 mb-1 uppercase">Período</p>
              <div className="flex flex-row space-x-2">
                <input type="date" className="bg-gray-50 px-2 py-1.5 rounded border border-gray-300 text-xs focus:ring-green-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="bg-gray-50 px-2 py-1.5 rounded border border-gray-300 text-xs focus:ring-green-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* BOTÃO PDF (MOVIDO PARA CÁ) */}
            <div className="pb-0.5">
                <button
                    onClick={handleExportPDF}
                    disabled={isGeneratingPdf}
                    className={`flex flex-row items-center space-x-1 border p-2 rounded-lg transition-all ${
                        isGeneratingPdf 
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                        : "text-red-600 border-red-200 hover:bg-red-50"
                    }`}
                    title="Baixar Relatório em PDF"
                >
                    {isGeneratingPdf ? (
                        <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                        <MdOutlineFileDownload className="h-5 w-5" />
                    )}
                    <p className="font-medium text-sm">PDF</p>
                </button>
            </div>

          </div>
        </div>
      </div>

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-12 gap-6 mx-4 mb-10">
        
        {/* LINHA 1 */}
        <div className={`col-span-12 border-green-500 h-[450px] !flex-row ${cardStyle}`}>
          <div className="flex flex-col space-y-4 w-1/5 pr-6 justify-center border-r border-gray-100 shrink-0">
             <h3 className="text-gray-500 font-bold uppercase text-sm mb-2">Resumo</h3>
             <InfoCard title="Entregues" value={cardMetrics.completed} icon={<img src={entrega} className="w-8 h-8 opacity-90" alt="Entregues" />} />
             <InfoCard title="Pendentes" value={cardMetrics.pending} icon={<img src={caixa} className="w-8 h-8 opacity-90" alt="Pendentes" />} />
          </div>
          <div className="flex-1 pl-4 min-w-0 flex flex-col">
             <h3 className="text-lg font-bold text-gray-800 mb-2">Evolução por Equipamento</h3>
             <div id="chart-evolution" className="flex-1 w-full min-h-0 relative bg-white">
                <ProjectEvolutionGraph categories={chartData.categories} series={chartData.series} />
             </div>
          </div>
        </div>

        {/* LINHA 2 */}
        <div className={`col-span-6 h-96 border-green-400 ${cardStyle}`}>
          <h3 className="text-base font-bold text-gray-700 mb-2">Consumo de Materiais</h3>
          <div id="chart-consumption" className="flex-1 w-full min-h-0 relative bg-white">
             <TotalConsumptionGraph data={dataConsumedMaterials} />
          </div>
        </div>

        <div className={`col-span-6 h-96 border-green-400 ${cardStyle}`}>
          <h3 className="text-base font-bold text-gray-700 mb-2">Lead Time Real vs Previsto</h3>
          <div id="chart-leadtime" className="flex-1 w-full min-h-0 relative bg-white">
             <LeadTimeGraph data={leadTimeData} />
          </div>
        </div>

        {/* LINHA 3 */}
        <div className={`col-span-6 h-96 border-gray-300 ${cardStyle}`}>
          <h3 className="text-base font-bold text-gray-700 mb-3">Detalhamento</h3>
          <div className={tableContainerStyle}>
             <div className="min-w-full inline-block align-top">
               <CascadeTable headers={["Projetos", "Valores"]} title="Detalhamento" filter={uniqueMaterialNames} values={dataConsumedMaterials} />
             </div>
          </div>
        </div>

        <div className={`col-span-6 h-96 border-red-400 ${cardStyle}`}>
          <h3 className="text-base font-bold text-gray-700 mb-3">Processos em Atraso</h3>
          <div className={tableContainerStyle}>
             <div className="min-w-full inline-block align-top">
               <CascadeTableTwoLevel data={processDelaysList.map((data) => ({ component_id: data.component_id, component_name: data.component_name, department_id: data.department_id, department_name: data.department_name, days_late: data.total_delay_time?.days || 0 }))} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}