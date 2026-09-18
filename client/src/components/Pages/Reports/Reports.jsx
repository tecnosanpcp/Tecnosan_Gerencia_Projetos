import { useState, useEffect, useCallback, useMemo } from "react";

// UI
import CascadeTable from "../../Ui/CascadeTable";
import CascadeTableTwoLevel from "../../Ui/CascadeTableTwoLevel";
import SelectMenu from "../../Ui/SelectMenu";

import ProjectEvolutionGraph from "./ProjectEvolutionGraph";
import TotalConsumptionGraph from "./TotalConsumptionGraph";
import LeadTimeGraph from "./LeadTimeGraph";

// Services
import { listProjects } from "@services/ProjectService";
import { getEquipment } from "@services/EquipmentService";
import { VerifyAuth } from "@services/AuthService";

import {
  countStatusComponentsByProj,
  getLeadTimeVsReal,
} from "@services/ComponentsServices";

import {
  vwProjectConsumedMaterials,
  vwProjectDepartmentDelays,
} from "@services/ViewsService";

// Utils
import {
  getDefaultDateRange,
  formatDateForApi,
} from "../../../utils/dateUtils";

// Assets
import entrega from "@imgs/entrega.png";
import caixa from "@imgs/caixa.png";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Icons
import {
  FaSpinner,
  FaFilePdf,
} from "react-icons/fa";

import {
  MdDateRange,
  MdRefresh,
  MdOutlineArrowBack,
  MdOutlineArrowForward,
  MdTrendingUp,
  MdAccessTime,
  MdWarningAmber,
} from "react-icons/md";

export default function Reports() {
  // =========================================================
  // FILTROS
  // =========================================================

  const defaultDates = getDefaultDateRange(3);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  const [selectedProj, setSelectedProj] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState([]);

  const [currentUserId, setCurrentUserId] = useState(null);

  // =========================================================
  // DADOS
  // =========================================================

  const [projects, setProjects] = useState([]);
  const [equipments, setEquipments] = useState([]);

  const [dataConsumedMaterials, setDataConsumedMaterials] =
    useState([]);

  const [processDelaysList, setProcessDelaysList] =
    useState([]);

  const [countStatusGraph, setCountStatusGraph] =
    useState([]);

  const [leadTimeData, setLeadTimeData] =
    useState([]);

  // =========================================================
  // LOADING
  // =========================================================

  const [isGeneratingPdf, setIsGeneratingPdf] =
    useState(false);

  // =========================================================
  // PROCESSAMENTO DAS MÉTRICAS
  // =========================================================

  const { chartData, cardMetrics } = useMemo(() => {
    const metrics = {
      completed: 0,
      pending: 0,
    };

    const equipmentMap = new Map();

    if (
      !countStatusGraph ||
      countStatusGraph.length === 0
    ) {
      return {
        chartData: {
          categories: [],
          series: [],
        },
        cardMetrics: metrics,
      };
    }

    countStatusGraph.forEach((item) => {
      const equipName =
        item.equipment_name || "Sem equipamento";

      const qtd =
        Number(item.numero_pecas) || 0;

      const status =
        (item.status || "").trim();

      if (status === "Completed") {
        metrics.completed += qtd;
      } else {
        metrics.pending += qtd;
      }

      if (!equipmentMap.has(equipName)) {
        equipmentMap.set(equipName, {
          entregues: 0,
          pendentes: 0,
        });
      }

      const entry =
        equipmentMap.get(equipName);

      if (status === "Completed") {
        entry.entregues += qtd;
      } else {
        entry.pendentes += qtd;
      }
    });

    const categories =
      Array.from(equipmentMap.keys());

    const series = [
      {
        name: "Entregues",
        data: categories.map(
          (category) =>
            equipmentMap.get(category).entregues
        ),
      },
      {
        name: "Pendentes",
        data: categories.map(
          (category) =>
            equipmentMap.get(category).pendentes
        ),
      },
    ];

    return {
      chartData: {
        categories,
        series,
      },
      cardMetrics: metrics,
    };
  }, [countStatusGraph]);

  // =========================================================
  // BUSCA DE PROJETOS / EQUIPAMENTOS
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchOptionsData = async () => {
      try {
        const user = await VerifyAuth();

        if (!user || !isMounted) return;

        setCurrentUserId(user.user_id);

        const [
          projData,
          equipData,
        ] = await Promise.all([
          listProjects(user.user_id),
          getEquipment(user.user_id),
        ]);

        if (!isMounted) return;

        setProjects(projData || []);
        setEquipments(equipData || []);
      } catch (error) {
        console.error(
          "Erro ao carregar filtros dos relatórios:",
          error
        );
      }
    };

    fetchOptionsData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================
  // BUSCA DOS DADOS DOS RELATÓRIOS
  // =========================================================

  const fetchDashboardMetrics = useCallback(async () => {
    if (!currentUserId) return;

    const projId =
      selectedProj.length > 0
        ? selectedProj[0]
        : null;

    const equipId =
      selectedEquip.length > 0
        ? selectedEquip[0]
        : null;

    try {
      const start =
        formatDateForApi(startDate);

      const end =
        formatDateForApi(endDate);

      const [
        graphRes,
        leadRes,
        matRes,
        delayRes,
      ] = await Promise.all([
        countStatusComponentsByProj(
          projId,
          equipId,
          start,
          end
        ),

        getLeadTimeVsReal(
          projId,
          equipId,
          start,
          end
        ),

        vwProjectConsumedMaterials(
          currentUserId,
          projId,
          start,
          end
        ),

        vwProjectDepartmentDelays(
          projId
        ),
      ]);

      setCountStatusGraph(
        graphRes || []
      );

      setLeadTimeData(
        leadRes || []
      );

      const matFiltered =
        (matRes || []).filter((material) =>
          projId
            ? material.project_id === projId
            : true
        );

      setDataConsumedMaterials(
        matFiltered
      );

      setProcessDelaysList(
        delayRes || []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar métricas dos relatórios:",
        error
      );
    }
  }, [
    selectedProj,
    selectedEquip,
    startDate,
    endDate,
    currentUserId,
  ]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  // =========================================================
  // EXPORTAÇÃO PDF
  // =========================================================

  const handleExportPDF = async () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const margin = 10;

      let currentY = 15;

      // -----------------------------------------------------
      // CABEÇALHO
      // -----------------------------------------------------

      doc.setFontSize(16);

      doc.text(
        "Relatório de Dashboard",
        margin,
        currentY
      );

      doc.setFontSize(10);

      doc.text(
        `Gerado em: ${new Date().toLocaleDateString(
          "pt-BR"
        )}`,
        pageWidth - margin,
        currentY,
        {
          align: "right",
        }
      );

      currentY += 10;

      doc.text(
        `Período: ${new Date(
          startDate
        ).toLocaleDateString(
          "pt-BR"
        )} a ${new Date(
          endDate
        ).toLocaleDateString(
          "pt-BR"
        )}`,
        margin,
        currentY
      );

      currentY += 10;

      // -----------------------------------------------------
      // GRÁFICOS
      // -----------------------------------------------------

      const addChartToPdf = async (
        elementId,
        title
      ) => {
        const element =
          document.getElementById(
            elementId
          );

        if (!element) return;

        if (currentY > 270) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(12);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          title,
          margin,
          currentY
        );

        currentY += 5;

        try {
          const canvas =
            await html2canvas(
              element,
              {
                scale: 2,
              }
            );

          const imgData =
            canvas.toDataURL(
              "image/png"
            );

          const imgProps =
            doc.getImageProperties(
              imgData
            );

          const pdfWidth =
            pageWidth -
            margin * 2;

          const pdfHeight =
            (imgProps.height *
              pdfWidth) /
            imgProps.width;

          if (
            currentY +
              pdfHeight >
            280
          ) {
            doc.addPage();
            currentY = 15;
          }

          doc.addImage(
            imgData,
            "PNG",
            margin,
            currentY,
            pdfWidth,
            pdfHeight
          );

          currentY +=
            pdfHeight + 10;
        } catch (error) {
          console.error(
            "Erro ao capturar gráfico:",
            error
          );
        }
      };

      await addChartToPdf(
        "chart-evolution",
        "Evolução por Equipamento"
      );

      await addChartToPdf(
        "chart-consumption",
        "Consumo de Materiais"
      );

      await addChartToPdf(
        "chart-leadtime",
        "Lead Time Real vs Previsto"
      );

      // -----------------------------------------------------
      // TABELA DE CONSUMO
      // -----------------------------------------------------

      if (currentY > 250) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(12);

      doc.text(
        "Detalhamento de Consumo",
        margin,
        currentY
      );

      currentY += 5;

      const consumptionRows =
        dataConsumedMaterials.map(
          (item) => [
            item.project_name || "-",
            item.material_name || "-",
            `${Number(
              item.total_material_consumed ||
                0
            ).toFixed(2)} kg`,
            `R$ ${Number(
              item.total_value || 0
            ).toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
              }
            )}`,
          ]
        );

      autoTable(doc, {
        startY: currentY,

        head: [
          [
            "Projeto",
            "Material",
            "Qtd (kg)",
            "Valor (R$)",
          ],
        ],

        body: consumptionRows,

        theme: "grid",

        styles: {
          fontSize: 8,
        },

        headStyles: {
          fillColor: [
            0,
            82,
            204,
          ],
        },
      });

      currentY =
        doc.lastAutoTable.finalY +
        15;

      // -----------------------------------------------------
      // TABELA DE ATRASOS
      // -----------------------------------------------------

      if (currentY > 250) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(12);

      doc.text(
        "Processos em Atraso",
        margin,
        currentY
      );

      currentY += 5;

      const delayRows =
        processDelaysList.map(
          (item) => [
            item.component_name ||
              "-",

            item.department_name ||
              "-",

            `${
              item.total_delay_time
                ?.days || 0
            } dias`,
          ]
        );

      autoTable(doc, {
        startY: currentY,

        head: [
          [
            "Componente",
            "Departamento",
            "Atraso",
          ],
        ],

        body: delayRows,

        theme: "grid",

        styles: {
          fontSize: 8,
        },

        headStyles: {
          fillColor: [
            222,
            53,
            11,
          ],
        },
      });

      doc.save(
        "Relatorio_Producao.pdf"
      );
    } catch (error) {
      console.error(
        "Erro ao gerar PDF:",
        error
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // =========================================================
  // DADOS AUXILIARES
  // =========================================================

  const uniqueMaterialNames = [
    ...new Set(
      dataConsumedMaterials.map(
        (item) =>
          item.material_name
      )
    ),
  ].filter(Boolean);

  const totalConsumptionKg =
    dataConsumedMaterials.reduce(
      (total, item) =>
        total +
        (Number(
          item.total_material_consumed
        ) || 0),
      0
    );

  const totalConsumptionValue =
    dataConsumedMaterials.reduce(
      (total, item) =>
        total +
        (Number(
          item.total_value
        ) || 0),
      0
    );

  const delayedProcesses =
    processDelaysList.length;

  // =========================================================
  // RESET DOS FILTROS
  // =========================================================

  const handleResetFilters = () => {
    const dates =
      getDefaultDateRange(3);

    setStartDate(dates.start);
    setEndDate(dates.end);

    setSelectedProj([]);
    setSelectedEquip([]);
  };

  // =========================================================
  // ESTILOS
  // =========================================================

  const scrollClass = `
    scrollbar-thin
    scrollbar-thumb-[#B7BDC8]
    scrollbar-track-transparent
    hover:scrollbar-thumb-[#97A0AF]
  `;

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F4F5F7] font-sans text-[#172B4D]">
      <div className="flex h-full min-h-0 flex-col px-4 py-4 lg:px-5 lg:py-5 xl:px-6">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <section className="shrink-0 rounded-xl border border-[#DFE1E6] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

          <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">

            {/* TÍTULO */}

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E9F2FF] text-[#0052CC]">
                <MdTrendingUp className="text-[23px]" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-bold tracking-[-0.2px] text-[#172B4D]">
                  Relatórios
                </h1>

                <p className="mt-0.5 truncate text-[11px] text-[#5E6C84]">
                  Indicadores e desempenho da produção
                </p>
              </div>

            </div>

            {/* FILTROS */}

            <div className="flex flex-wrap items-end gap-2.5">

              {/* PROJETO */}

              <div className="w-[190px]">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.4px] text-[#5E6C84]">
                  Projeto
                </label>

                <SelectMenu
                  className="h-9 w-full"
                  maxSelections={1}
                  options={projects.map(
                    (project) => ({
                      id: project.project_id,
                      label:
                        project.project_name,
                    })
                  )}
                  selectedOption={
                    selectedProj
                  }
                  setSelectedOption={
                    setSelectedProj
                  }
                />
              </div>

              {/* EQUIPAMENTO */}

              <div className="w-[190px]">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.4px] text-[#5E6C84]">
                  Equipamento
                </label>

                <SelectMenu
                  className="h-9 w-full"
                  maxSelections={1}
                  options={equipments.map(
                    (equipment) => ({
                      id:
                        equipment.equipment_id,
                      label:
                        equipment.equipment_name,
                    })
                  )}
                  selectedOption={
                    selectedEquip
                  }
                  setSelectedOption={
                    setSelectedEquip
                  }
                />
              </div>

              {/* PERÍODO */}

              <div>
                <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.4px] text-[#5E6C84]">
                  <MdDateRange />
                  Período
                </label>

                <div className="flex items-center gap-1.5">

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    className="h-9 rounded-lg border border-[#DFE1E6] bg-white px-2 text-[11px] text-[#172B4D] outline-none transition focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]"
                  />

                  <span className="text-[10px] text-[#97A0AF]">
                    até
                  </span>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    className="h-9 rounded-lg border border-[#DFE1E6] bg-white px-2 text-[11px] text-[#172B4D] outline-none transition focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#DEEBFF]"
                  />

                </div>
              </div>

              {/* RESET */}

              <button
                type="button"
                onClick={handleResetFilters}
                title="Restaurar filtros"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#DFE1E6] bg-white px-3 text-[11px] font-semibold text-[#5E6C84] transition hover:border-[#B7BDC8] hover:bg-[#F4F5F7] hover:text-[#172B4D]"
              >
                <MdRefresh className="text-[17px]" />
                Restaurar
              </button>

              {/* PDF */}

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={
                  isGeneratingPdf
                }
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold transition ${
                  isGeneratingPdf
                    ? "cursor-not-allowed bg-[#F4F5F7] text-[#97A0AF]"
                    : "bg-[#0052CC] text-white hover:bg-[#0065FF]"
                }`}
              >
                {isGeneratingPdf ? (
                  <FaSpinner className="animate-spin text-[13px]" />
                ) : (
                  <FaFilePdf className="text-[13px]" />
                )}

                {isGeneratingPdf
                  ? "Gerando..."
                  : "Exportar PDF"}
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            CONTEÚDO
        ===================================================== */}

        <main
          className={`mt-4 min-h-0 flex-1 overflow-y-auto pr-1 ${scrollClass}`}
        >

          <div className="grid grid-cols-12 gap-4 pb-4">

            {/* =================================================
                KPI 1
            ================================================= */}

            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <div className="h-full rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5E6C84]">
                      Componentes entregues
                    </p>

                    <p className="mt-2 text-[25px] font-bold leading-none text-[#172B4D]">
                      {cardMetrics.completed.toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E3FCEF]">
                    <img
                      src={entrega}
                      alt="Entregues"
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-[#00875A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00875A]" />
                  Dentro do período selecionado
                </div>

              </div>
            </div>

            {/* =================================================
                KPI 2
            ================================================= */}

            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <div className="h-full rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5E6C84]">
                      Componentes pendentes
                    </p>

                    <p className="mt-2 text-[25px] font-bold leading-none text-[#172B4D]">
                      {cardMetrics.pending.toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0E6]">
                    <img
                      src={caixa}
                      alt="Pendentes"
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-[#DE350B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#DE350B]" />
                  Acompanhar execução
                </div>

              </div>
            </div>

            {/* =================================================
                KPI 3
            ================================================= */}

            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <div className="h-full rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5E6C84]">
                      Consumo de materiais
                    </p>

                    <p className="mt-2 text-[22px] font-bold leading-none text-[#172B4D]">
                      {totalConsumptionKg.toLocaleString(
                        "pt-BR",
                        {
                          maximumFractionDigits: 1,
                        }
                      )}{" "}
                      <span className="text-[12px] font-semibold text-[#5E6C84]">
                        KG
                      </span>
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E9F2FF] text-[#0052CC]">
                    <MdTrendingUp className="text-[21px]" />
                  </div>

                </div>

                <p className="mt-3 text-[10px] text-[#5E6C84]">
                  R${" "}
                  {totalConsumptionValue.toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  em valor consumido
                </p>

              </div>
            </div>

            {/* =================================================
                KPI 4
            ================================================= */}

            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <div className="h-full rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#5E6C84]">
                      Processos em atraso
                    </p>

                    <p className="mt-2 text-[25px] font-bold leading-none text-[#172B4D]">
                      {delayedProcesses.toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFEBE6] text-[#DE350B]">
                    <MdWarningAmber className="text-[22px]" />
                  </div>

                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-[#DE350B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#DE350B]" />
                  Necessitam acompanhamento
                </div>

              </div>
            </div>

            {/* =================================================
                EVOLUÇÃO POR EQUIPAMENTO
            ================================================= */}

            <section className="col-span-12 xl:col-span-8">
              <div
                id="chart-evolution"
                className="h-[390px] rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]"
              >

                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#172B4D]">
                      Evolução por equipamento
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[#5E6C84]">
                      Componentes entregues e pendentes no período
                    </p>
                  </div>
                </div>

                <div className="h-[calc(100%-45px)] min-h-0">
                  <ProjectEvolutionGraph
                    categories={
                      chartData.categories
                    }
                    series={
                      chartData.series
                    }
                  />
                </div>

              </div>
            </section>

            {/* =================================================
                LEAD TIME
            ================================================= */}

            <section className="col-span-12 xl:col-span-4">
              <div
                id="chart-leadtime"
                className="h-[390px] rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]"
              >

                <div className="mb-1 flex items-center gap-2">
                  

                  <div>
                    <h2 className="text-[14px] font-semibold text-[#172B4D]">
                      Lead Time
                    </h2>

                    <p className="text-[10px] text-[#5E6C84]">
                      Real vs previsto
                    </p>
                  </div>
                </div>

                <div className="h-[calc(100%-48px)] min-h-0">
                  <LeadTimeGraph
                    data={leadTimeData}
                  />
                </div>

              </div>
            </section>

            {/* =================================================
                CONSUMO
            ================================================= */}

            <section className="col-span-12 xl:col-span-7">
              <div
                id="chart-consumption"
                className="h-[380px] rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]"
              >

                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#172B4D]">
                      Consumo de materiais
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[#5E6C84]">
                      Distribuição do consumo por projeto
                    </p>
                  </div>
                </div>

                <div className="h-[calc(100%-45px)] min-h-0">
                  <TotalConsumptionGraph
                    data={
                      dataConsumedMaterials
                    }
                  />
                </div>

              </div>
            </section>

            {/* =================================================
                DETALHAMENTO
            ================================================= */}

            <section className="col-span-12 xl:col-span-5">
              <div className="flex h-[380px] min-h-0 flex-col rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="mb-3 flex items-center justify-between">

                  <div>
                    <h2 className="text-[14px] font-semibold text-[#172B4D]">
                      Detalhamento
                    </h2>

                    <p className="mt-0.5 text-[10px] text-[#5E6C84]">
                      Materiais utilizados
                    </p>
                  </div>

                  <span className="rounded-full bg-[#F4F5F7] px-2 py-1 text-[9px] font-semibold text-[#5E6C84]">
                    {uniqueMaterialNames.length} materiais
                  </span>

                </div>

                <div
                  className={`min-h-0 flex-1 overflow-auto rounded-lg border border-[#EBECF0] bg-[#FAFBFC] ${scrollClass}`}
                >
                  <div className="min-w-full">
                    <CascadeTable
                      headers={[
                        "Projetos",
                        "Valores",
                      ]}
                      title="Detalhamento"
                      filter={
                        uniqueMaterialNames
                      }
                      values={
                        dataConsumedMaterials
                      }
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* =================================================
                PROCESSOS EM ATRASO
            ================================================= */}

            <section className="col-span-12">
              <div className="flex h-[340px] min-h-0 flex-col rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFEBE6] text-[#DE350B]">
                      <MdWarningAmber className="text-[19px]" />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-semibold text-[#172B4D]">
                        Processos em atraso
                      </h2>

                      <p className="mt-0.5 text-[10px] text-[#5E6C84]">
                        Componentes e departamentos que precisam de acompanhamento
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-[#FFEBE6] px-2.5 py-1 text-[9px] font-semibold text-[#DE350B]">
                    {processDelaysList.length} ocorrências
                  </span>

                </div>

                <div
                  className={`min-h-0 flex-1 overflow-auto rounded-lg border border-[#EBECF0] bg-[#FAFBFC] ${scrollClass}`}
                >
                  <div className="min-w-full">
                    <CascadeTableTwoLevel
                      data={processDelaysList.map(
                        (data) => ({
                          component_id:
                            data.component_id,

                          component_name:
                            data.component_name,

                          department_id:
                            data.department_id,

                          department_name:
                            data.department_name,

                          days_late:
                            data
                              .total_delay_time
                              ?.days || 0,
                        })
                      )}
                    />
                  </div>
                </div>

              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}