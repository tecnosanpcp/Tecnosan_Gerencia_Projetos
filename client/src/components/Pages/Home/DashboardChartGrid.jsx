import { useCallback, useMemo, useState } from "react";
import {
  Maximize2,
  Eye,
  EyeOff,
  X,
  Settings2,
  ChevronDown,
  GripVertical,
  GitCompareArrows,
} from "lucide-react";

import ChartCompareModal from "./ChartCompareModal.jsx";

const CHARTS = [
  {
    id: "materials",
    title: "Consumo de Materiais",
    subtitle: "Consumo no ano atual",
    category: "Produção",
    comparables: ["waste"],
  },

  {
    id: "waste",
    title: "Desperdício de Materiais",
    subtitle: "Acompanhamento de refugo",
    category: "Qualidade",
    comparables: ["materials"],
  },

  {
    id: "projects",
    title: "Projetos",
    subtitle: "Visão dos projetos",
    category: "Projetos",
    comparables: [],
  },

  {
    id: "employees",
    title: "Colaboradores",
    subtitle: "Distribuição por colaboradores",
    category: "RH",
    comparables: [],
  },

  /*
   * ==========================================================
   * GRÁFICOS VINDOS DE RELATÓRIOS
   * ==========================================================
   */

  {
    id: "report-evolution",
    title: "Evolução por Equipamento",
    subtitle: "Entregues e pendentes por equipamento",
    category: "Produção",
    comparables: [],
  },

  {
    id: "report-consumption",
    title: "Consumo por Projeto",
    subtitle: "Consumo de materiais por projeto",
    category: "Produção",
    comparables: [],
  },

  {
    id: "report-leadtime",
    title: "Lead Time",
    subtitle: "Tempo real comparado à meta",
    category: "Produção",
    comparables: [],
  },
];

const CATEGORIES = [
  "Todos",
  "Produção",
  "Qualidade",
  "Projetos",
  "RH",
];

export default function DashboardChartGrid({ charts }) {
  const [visible, setVisible] = useState(
    () => new Set(CHARTS.map((chart) => chart.id))
  );

  const [minimized, setMinimized] = useState(
    () => new Set()
  );

  const [expanded, setExpanded] = useState(null);

  const [customizing, setCustomizing] = useState(false);

  const [comparison, setComparison] = useState(null);

  const [orderedCharts, setOrderedCharts] = useState(
    () => CHARTS.map((chart) => chart.id)
  );

  const [draggingId, setDraggingId] = useState(null);

  const [dropTargetId, setDropTargetId] = useState(null);

  const toggleVisible = useCallback((id) => {
    setVisible((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const toggleMinimized = useCallback((id) => {
    setMinimized((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const showAll = () => {
    setVisible(new Set(CHARTS.map((chart) => chart.id)));
  };

  const hideAll = () => {
    setVisible(new Set());
  };

  const expandAll = () => {
    setMinimized(new Set());
  };

  const minimizeAll = () => {
    setMinimized(
      new Set(CHARTS.map((chart) => chart.id))
    );
  };

  const activeCharts = useMemo(() => {
    return orderedCharts
      .map((id) =>
        CHARTS.find((chart) => chart.id === id)
      )
      .filter(Boolean)
      .filter((chart) => visible.has(chart.id));
  }, [orderedCharts, visible]);

  const chartById = useMemo(
    () =>
      Object.fromEntries(
        charts.map((chart) => [chart.id, chart])
      ),
    [charts]
  );

  /*
   * ============================================================
   * ARRASTAR PARA REORGANIZAR
   * ============================================================
   */

  const handleReorderDragStart = (event, id) => {
    event.stopPropagation();

    setDraggingId(id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-dashboard-reorder",
      id
    );
  };

  const handleReorderDragOver = (event, targetId) => {
    event.preventDefault();

    const sourceId = event.dataTransfer.getData(
      "application/x-dashboard-reorder"
    );

    if (!sourceId || sourceId === targetId) {
      return;
    }

    setDropTargetId(targetId);
  };

  const handleReorderDrop = (event, targetId) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceId = event.dataTransfer.getData(
      "application/x-dashboard-reorder"
    );

    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    setOrderedCharts((current) => {
      const next = [...current];

      const sourceIndex = next.indexOf(sourceId);
      const targetIndex = next.indexOf(targetId);

      if (
        sourceIndex === -1 ||
        targetIndex === -1
      ) {
        return current;
      }

      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceId);

      return next;
    });

    setDraggingId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  /*
   * ============================================================
   * ARRASTAR GRÁFICO PARA COMPARAR
   * ============================================================
   */

  const handleChartDragStart = (event, id) => {
    event.stopPropagation();

    setDraggingId(id);

    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-dashboard-compare",
      id
    );
  };

  const handleChartCompareDragOver = (
    event,
    targetId
  ) => {
    const sourceId = event.dataTransfer.getData(
      "application/x-dashboard-compare"
    );

    if (!sourceId || sourceId === targetId) {
      return;
    }

    const source = CHARTS.find(
      (chart) => chart.id === sourceId
    );

    if (!source?.comparables?.includes(targetId)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    setDropTargetId(targetId);
  };

  const handleChartCompareDrop = (
    event,
    targetId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceId = event.dataTransfer.getData(
      "application/x-dashboard-compare"
    );

    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const source = CHARTS.find(
      (chart) => chart.id === sourceId
    );

    if (!source?.comparables?.includes(targetId)) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    setComparison({
      first: sourceId,
      second: targetId,
    });

    setDraggingId(null);
    setDropTargetId(null);
  };

  return (
    <section className="w-full">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="m-0 text-[16px] font-bold text-[#172B4D]">
            Indicadores
          </h2>

          <p className="m-0 mt-0.5 text-[12px] text-[#5E6C84]">
            Acompanhe os principais indicadores de produção.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={showAll}
            className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-[#0052CC] text-[11px] font-semibold hover:bg-[#E9F2FF] transition-colors"
          >
            Mostrar todos
          </button>

          <button
            type="button"
            onClick={hideAll}
            className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-[#5E6C84] text-[11px] font-semibold hover:bg-[#F4F5F7] transition-colors"
          >
            Ocultar todos
          </button>

          <button
            type="button"
            onClick={expandAll}
            className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-[#5E6C84] text-[11px] font-semibold hover:bg-[#F4F5F7] transition-colors"
          >
            Expandir todos
          </button>

          <button
            type="button"
            onClick={minimizeAll}
            className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-[#5E6C84] text-[11px] font-semibold hover:bg-[#F4F5F7] transition-colors"
          >
            Minimizar todos
          </button>

          <button
            type="button"
            onClick={() => setCustomizing(true)}
            className={`h-8 px-3 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
              customizing
                ? "bg-[#0052CC] border-[#0052CC] text-white"
                : "bg-white border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]"
            }`}
          >
            <Settings2 size={14} />
            Personalizar Dashboard
          </button>
        </div>
      </div>

      {/* INSTRUÇÃO DE ARRASTAR */}
      <div className="mb-3 flex items-center gap-2 text-[10px] text-[#6B778C]">
        <GitCompareArrows
          size={13}
          className="text-[#0052CC]"
        />

        <span>
          Arraste o conteúdo de um gráfico sobre outro para
          comparar.
        </span>

        <span className="text-[#DFE1E6]">•</span>

        <GripVertical
          size={13}
          className="text-[#97A0AF]"
        />

        <span>
          Use o ícone de movimentação para reorganizar.
        </span>
      </div>

      {/* GRID */}
      {activeCharts.length === 0 ? (
        <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center">
          <EyeOff
            size={38}
            className="mx-auto mb-3 text-[#97A0AF]"
          />

          <p className="m-0 text-sm font-semibold text-[#5E6C84]">
            Nenhum gráfico selecionado
          </p>

          <button
            type="button"
            onClick={showAll}
            className="mt-3 h-9 px-4 rounded bg-[#0052CC] text-white text-[12px] font-semibold hover:bg-[#0747A6]"
          >
            Mostrar gráficos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 items-start">
          {activeCharts.map((def) => (
            <ChartCard
              key={def.id}
              def={def}
              content={chartById[def.id]?.element}
              minimized={minimized.has(def.id)}
              dragging={draggingId === def.id}
              dropTarget={dropTargetId === def.id}
              onToggleMinimize={() =>
                toggleMinimized(def.id)
              }
              onExpand={() => setExpanded(def.id)}
              onHide={() => toggleVisible(def.id)}
              onReorderDragStart={handleReorderDragStart}
              onChartDragStart={handleChartDragStart}
              onReorderDragOver={handleReorderDragOver}
              onReorderDrop={handleReorderDrop}
              onCompareDragOver={
                handleChartCompareDragOver
              }
              onCompareDrop={handleChartCompareDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      {/* PERSONALIZAÇÃO */}
      <CustomizePanel
        open={customizing}
        visible={visible}
        onClose={() => setCustomizing(false)}
        onToggle={toggleVisible}
        onShowAll={showAll}
        onHideAll={hideAll}
      />

      {/* TELA CHEIA */}
      {expanded && chartById[expanded] && (
        <ExpandModal
          title={
            CHARTS.find((chart) => chart.id === expanded)
              ?.title
          }
          subtitle={
            CHARTS.find((chart) => chart.id === expanded)
              ?.subtitle
          }
          onClose={() => setExpanded(null)}
        >
          {chartById[expanded].element}
        </ExpandModal>
      )}

      {/* COMPARAÇÃO */}
      {comparison && (
        <ChartCompareModal
          firstChart={comparison.first}
          secondChart={comparison.second}
          onClose={() => setComparison(null)}
          onChangeSecond={(second) =>
            setComparison((prev) => ({
              ...prev,
              second,
            }))
          }
        />
      )}
    </section>
  );
}

/* ============================================================
   CARD
============================================================ */

function ChartCard({
  def,
  content,
  minimized,
  dragging,
  dropTarget,
  onToggleMinimize,
  onExpand,
  onHide,
  onReorderDragStart,
  onChartDragStart,
  onReorderDragOver,
  onReorderDrop,
  onCompareDragOver,
  onCompareDrop,
  onDragEnd,
}) {
  return (
    <article
      onDragOver={(event) => {
        onReorderDragOver(event, def.id);
        onCompareDragOver(event, def.id);
      }}
      onDrop={(event) => {
        const compareId = event.dataTransfer.getData(
          "application/x-dashboard-compare"
        );

        if (compareId) {
          onCompareDrop(event, def.id);
        } else {
          onReorderDrop(event, def.id);
        }
      }}
      className={`relative bg-white rounded border overflow-hidden transition-all duration-200 ${
        dragging
          ? "opacity-40 scale-[0.98]"
          : "opacity-100"
      } ${
        dropTarget
          ? "border-[#0052CC] shadow-[0_0_0_2px_rgba(0,82,204,0.18),0_8px_24px_rgba(9,30,66,0.14)]"
          : "border-[#DFE1E6] shadow-[0_1px_3px_rgba(0,0,0,0.07)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
      }`}
    >
      {/* INDICADOR DE COMPARAÇÃO */}
      {dropTarget && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-[#0052CC]/[0.04] flex items-center justify-center">
          <div className="px-4 py-2 rounded-md bg-white border border-[#B3D4FF] shadow-[0_4px_14px_rgba(9,30,66,0.15)] flex items-center gap-2">
            <GitCompareArrows
              size={16}
              className="text-[#0052CC]"
            />

            <span className="text-[11px] font-bold text-[#0052CC]">
              Solte para comparar
            </span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header
        className={`flex items-center gap-2.5 px-3.5 py-2.5 ${
          minimized
            ? ""
            : "border-b border-[#F4F5F7]"
        }`}
      >
        {/* HANDLE DE REORDENAÇÃO */}
        <button
          type="button"
          draggable
          onDragStart={(event) =>
            onReorderDragStart(event, def.id)
          }
          onDragEnd={onDragEnd}
          title="Arrastar para reorganizar"
          aria-label="Arrastar para reorganizar"
          className="w-6 h-7 flex items-center justify-center rounded text-[#97A0AF] hover:bg-[#F4F5F7] hover:text-[#0052CC] cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical size={15} />
        </button>

        <span className="w-[3px] h-4 rounded-full bg-[#0052CC] shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="m-0 text-[11px] font-bold text-[#5E6C84] uppercase tracking-[0.07em] truncate">
            {def.title}
          </p>

          {!minimized && (
            <p className="m-0 mt-px text-[10px] text-[#97A0AF] truncate">
              {def.subtitle}
            </p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <ChartAction
            title={
              minimized
                ? "Expandir card"
                : "Minimizar card"
            }
            onClick={onToggleMinimize}
          >
            <ChevronDown
              size={13}
              className={`transition-transform ${
                minimized ? "rotate-180" : ""
              }`}
            />
          </ChartAction>

          <ChartAction
            title="Ocultar gráfico"
            onClick={onHide}
          >
            <EyeOff size={13} />
          </ChartAction>

          <ChartAction
            title="Abrir em tela cheia"
            onClick={onExpand}
          >
            <Maximize2 size={13} />
          </ChartAction>
        </div>
      </header>

      {/* CONTEÚDO ARRASTÁVEL PARA COMPARAÇÃO */}
      {!minimized && (
        <div
          draggable={
            def.comparables?.length > 0
          }
          onDragStart={(event) =>
            onChartDragStart(event, def.id)
          }
          onDragEnd={onDragEnd}
          className={`relative p-2 min-h-[220px] ${
            def.comparables?.length > 0
              ? "cursor-grab active:cursor-grabbing"
              : ""
          }`}
        >
          {def.comparables?.length > 0 && (
            <div className="absolute right-3 top-2 z-10 pointer-events-none opacity-0 group-hover:opacity-100">
              <GitCompareArrows
                size={13}
                className="text-[#0052CC]"
              />
            </div>
          )}

          {content}
        </div>
      )}
    </article>
  );
}

function ChartAction({
  title,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded border border-[#DFE1E6] bg-transparent text-[#97A0AF] hover:bg-[#F4F5F7] hover:text-[#172B4D] transition-colors"
    >
      {children}
    </button>
  );
}

/* ============================================================
   PERSONALIZAÇÃO
============================================================ */

function CustomizePanel({
  open,
  visible,
  onClose,
  onToggle,
  onShowAll,
  onHideAll,
}) {
  const [category, setCategory] = useState("Todos");

  const filtered =
    category === "Todos"
      ? CHARTS
      : CHARTS.filter(
          (chart) => chart.category === category
        );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar personalização"
          onClick={onClose}
          className="fixed inset-0 z-[8000] bg-transparent cursor-default"
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 z-[8001] w-[340px] max-w-[92vw] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.18)] flex flex-col transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="px-5 pt-5 pb-4 border-b border-[#DFE1E6] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-[15px] font-bold text-[#172B4D]">
                Personalizar Dashboard
              </h3>

              <p className="m-0 mt-1 text-[12px] text-[#5E6C84]">
                Selecione os gráficos que deseja visualizar.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#97A0AF] hover:text-[#172B4D]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  category === cat
                    ? "bg-[#E9F2FF] text-[#0052CC]"
                    : "bg-[#F4F5F7] text-[#5E6C84] hover:bg-[#EBECF0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 px-5 py-2.5 border-b border-[#F4F5F7]">
          <button
            type="button"
            onClick={onShowAll}
            className="flex-1 py-1.5 rounded bg-[#E9F2FF] text-[#0052CC] text-[11px] font-bold"
          >
            Mostrar todos
          </button>

          <button
            type="button"
            onClick={onHideAll}
            className="flex-1 py-1.5 rounded bg-[#F4F5F7] text-[#5E6C84] text-[11px] font-bold"
          >
            Ocultar todos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {filtered.map((chart) => {
              const active = visible.has(chart.id);

              return (
                <button
                  key={chart.id}
                  type="button"
                  onClick={() => onToggle(chart.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-md border transition-colors ${
                    active
                      ? "border-[#B3D4FF] bg-[#F7FAFF]"
                      : "border-[#DFE1E6] bg-white hover:bg-[#F4F5F7]"
                  }`}
                >
                  <span className="w-7 h-7 rounded-md bg-[#E9F2FF] flex items-center justify-center shrink-0 text-[#0052CC]">
                    {active ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-semibold text-[#172B4D] truncate">
                      {chart.title}
                    </span>

                    <span className="block mt-0.5 text-[10px] text-[#97A0AF]">
                      {chart.category}
                    </span>
                  </span>

                  <span
                    className={`w-8 h-[18px] rounded-full p-0.5 ${
                      active
                        ? "bg-[#0052CC]"
                        : "bg-[#DFE1E6]"
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        active
                          ? "translate-x-3.5"
                          : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#DFE1E6] shrink-0 text-center text-[11px] text-[#97A0AF]">
          {visible.size} de {CHARTS.length} gráficos ativos
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   EXPANDIR GRÁFICO
============================================================ */

function ExpandModal({
  title,
  subtitle,
  onClose,
  children,
}) {
  return (
    <div
      className="fixed inset-0 z-[9000] bg-[rgba(9,30,66,0.58)] backdrop-blur-[5px] flex items-center justify-center p-6"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-[1100px] max-h-[90vh] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#DFE1E6] shrink-0">
          <span className="w-1 h-5 rounded bg-[#0052CC]" />

          <div className="flex-1">
            <h2 className="m-0 text-[17px] font-bold text-[#172B4D]">
              {title}
            </h2>

            <p className="m-0 mt-0.5 text-[12px] text-[#5E6C84]">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded border border-[#DFE1E6] text-[#5E6C84] hover:bg-[#F4F5F7]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}   