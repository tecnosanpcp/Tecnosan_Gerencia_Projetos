function DataPanel({
  title,
  value,
  unit,
  comparison,
  previousMonth,
  previousYear,
  onOpen,
}) {
  const hasComparison = comparison !== undefined && comparison !== null;

  const isPositive = Number(comparison) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-[4px] border border-[#DFE1E6] bg-white shadow-[0_1px_3px_rgba(9,30,66,0.08)] transition-shadow duration-100 hover:shadow-[0_4px_12px_rgba(9,30,66,0.12)]">
      <div className="p-4 pl-[18px]">
        <div className="mb-2 flex items-center justify-between">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5E6C84]">
            {title}
          </p>

          <button
            type="button"
            onClick={onOpen}
            title={`Ver gráfico de ${title}`}
            aria-label={`Ver gráfico de ${title}`}
            className="
              flex h-6 w-6 items-center justify-center
              rounded-[4px]
              bg-[#F4F5F7]
              text-[#0052CC]
              transition-all duration-150
              hover:bg-[#DEEBFF]
              hover:text-[#0747A6]
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-[#B3D4FF]
            "
          >
            <KpiIcon />
          </button>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[#172B4D]">
            {Number(value || 0).toLocaleString("pt-BR")}
          </span>

          <span className="text-[12px] font-semibold text-[#6B778C]">
            {unit}
          </span>
        </div>

        <div className="mt-3 border-t border-[#F4F5F7] pt-3">
          {hasComparison ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`
                  flex items-center gap-1
                  text-[11px]
                  font-bold
                  ${isPositive ? "text-[#00875A]" : "text-[#DE350B]"}
                `}
              >
                {isPositive ? "↑" : "↓"}
                {Math.abs(Number(comparison)).toFixed(1)}%
              </span>

              <span className="text-[10px] text-[#97A0AF]">
                vs. mês anterior
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#6B778C]">
                Comparação
              </span>

              <span className="text-[10px] text-[#97A0AF]">— mês anterior</span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#97A0AF]">
              Mesmo mês em períodos anteriores
            </span>

            <span className="text-[10px] font-semibold text-[#0052CC]">
              Histórico
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12V7M8 12V4M13 12V2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M2 14h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default DataPanel;
